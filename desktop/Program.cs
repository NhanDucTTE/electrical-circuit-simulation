using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: AssemblyTitle("Mô phỏng tủ điện 2D")]
[assembly: AssemblyDescription("Ứng dụng Windows kiểm thử logic sơ đồ tủ điện")]
[assembly: AssemblyProduct("Mô phỏng tủ điện 2D")]
[assembly: AssemblyCompany("Công ty TNHH Takasago Vietnam")]
[assembly: AssemblyCopyright("Nguyên Nhân Đức · nhanduc.business@gmail.com")]
[assembly: AssemblyVersion("1.4.3.0")]
[assembly: AssemblyFileVersion("1.4.3.0")]

internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        var verification = args.Length == 2 && args[0] == "--verify-offline"
            ? new Verification(Path.GetFullPath(args[1])) : null;
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        using (var form = new DesktopWindow(verification)) Application.Run(form);
        return verification == null ? 0 : verification.ExitCode;
    }
}

internal sealed partial class DesktopWindow : Form
{
    internal const string TitleText = "Mô phỏng tủ điện 2D";
    private const string Host = "mophongtudien.local.invalid";
    private const string Page = "https://" + Host + "/index.html";
    private const string Extension = ".td2d.json";
    private string FileFilter { get { return Localized("Dự án tủ điện", "Electrical project", "電気回路プロジェクト") + " (*.td2d.json)|*.td2d.json|JSON (*.json)|*.json"; } }
    private string language = "vi";
    private string WindowTitle { get { return Localized(TitleText, "Electrical Cabinet Simulator 2D", "電気制御盤シミュレータ2D"); } }

    private string Localized(string vietnamese, string english, string japanese)
    {
        return language == "en" ? english : language == "ja" ? japanese : vietnamese;
    }
    private const int FileLimit = 10 * 1024 * 1024;
    private const int RecoveryLimit = 128 * 1024 * 1024;
    private static readonly UTF8Encoding Utf8 = new UTF8Encoding(false, true);
    private readonly JavaScriptSerializer json = new JavaScriptSerializer { MaxJsonLength = 2 * RecoveryLimit + 1024 };
    private readonly HashSet<string> authorizedPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    private readonly Queue<Dictionary<string, object>> requests = new Queue<Dictionary<string, object>>();
    private readonly string bundle = AppDomain.CurrentDomain.BaseDirectory;
    private readonly string dataFolder;
    private readonly Verification verification;
    private readonly WebView2 view = new WebView2 { Dock = DockStyle.Fill };
    private bool dirty;
    private bool bridgeBusy;
    private bool verified;

    internal DesktopWindow(Verification verification)
    {
        this.verification = verification;
        dataFolder = verification == null
            ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MoPhongTuDien2D")
            : verification.Folder;
        Text = TitleText;
        AutoScaleMode = AutoScaleMode.Dpi;
        BackColor = Color.FromArgb(246, 248, 251);
        StartPosition = FormStartPosition.CenterScreen;
        MinimumSize = new Size(880, 580);
        var workArea = Screen.PrimaryScreen.WorkingArea;
        ClientSize = new Size(Math.Max(880, Math.Min(1370, workArea.Width - 60)),
            Math.Max(580, Math.Min(850, workArea.Height - 65)));
        Icon = Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location);
        Controls.Add(view);
        Shown += Initialize;
    }

    private async void Initialize(object sender, EventArgs args)
    {
        try
        {
            if (!File.Exists(Path.Combine(bundle, "web", "index.html")))
                throw new FileNotFoundException("Thiếu thư mục web của bản chạy. Hãy giải nén toàn bộ gói portable.");

            Directory.CreateDirectory(dataFolder);
            var options = new CoreWebView2EnvironmentOptions(
                "--disable-background-networking --disable-component-update --disable-sync --disable-breakpad --metrics-recording-only --no-pings");
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(dataFolder, "WebView2"), options);
            await view.EnsureCoreWebView2Async(environment);
            var core = view.CoreWebView2;
            core.Settings.AreDevToolsEnabled = false;
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.AreBrowserAcceleratorKeysEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.IsZoomControlEnabled = false;
            core.Settings.IsGeneralAutofillEnabled = false;
            core.Settings.IsPasswordAutosaveEnabled = false;
            core.Settings.AreHostObjectsAllowed = false;
            core.NavigationStarting += delegate(object s, CoreWebView2NavigationStartingEventArgs e)
            {
                e.Cancel = !String.Equals(e.Uri, Page, StringComparison.OrdinalIgnoreCase);
            };
            core.FrameNavigationStarting += delegate(object s, CoreWebView2NavigationStartingEventArgs e) { e.Cancel = true; };
            core.NewWindowRequested += delegate(object s, CoreWebView2NewWindowRequestedEventArgs e) { e.Handled = true; };
            core.PermissionRequested += delegate(object s, CoreWebView2PermissionRequestedEventArgs e) { e.State = CoreWebView2PermissionState.Deny; };
            core.DownloadStarting += delegate(object s, CoreWebView2DownloadStartingEventArgs e) { e.Cancel = true; };
            core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
            core.WebResourceRequested += delegate(object s, CoreWebView2WebResourceRequestedEventArgs e)
            {
                if (!IsLocalOrigin(e.Request.Uri))
                    e.Response = environment.CreateWebResourceResponse(new MemoryStream(), 403, "Forbidden", "Cache-Control: no-store");
            };
            core.SetVirtualHostNameToFolderMapping(Host, Path.Combine(bundle, "web"), CoreWebView2HostResourceAccessKind.Deny);
            core.WebMessageReceived += Receive;
            core.NavigationCompleted += NavigationCompleted;
            await core.AddScriptToExecuteOnDocumentCreatedAsync(ReadResource("bridge.js"));
            if (verification != null) await core.AddScriptToExecuteOnDocumentCreatedAsync(
                "window.desktopStartupErrors=[];" +
                "addEventListener('error', e=>desktopStartupErrors.push(e.message || 'Không tải: '+(e.target.src||e.target.href||e.type)),true);" +
                "addEventListener('unhandledrejection', e=>desktopStartupErrors.push(String(e.reason)));");
            await core.CallDevToolsProtocolMethodAsync("Network.enable", "{}");
            await core.CallDevToolsProtocolMethodAsync("Network.emulateNetworkConditions",
                "{\"offline\":true,\"latency\":0,\"downloadThroughput\":0,\"uploadThroughput\":0}");
            core.Navigate(Page);
        }
        catch (Exception error)
        {
            if (verification != null)
                verification.WriteFailure(error);
            else
                MessageBox.Show(this, "Không mở được ứng dụng. Cần Microsoft Edge WebView2 Runtime có sẵn trên máy.\n\n" + error.Message,
                    TitleText, MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }

    private static bool IsLocalOrigin(string raw)
    {
        Uri uri;
        return Uri.TryCreate(raw, UriKind.Absolute, out uri) && uri.Scheme == "https" && uri.IsDefaultPort
            && String.Equals(uri.Host, Host, StringComparison.OrdinalIgnoreCase);
    }

    private void Receive(object sender, CoreWebView2WebMessageReceivedEventArgs args)
    {
        if (!String.Equals(args.Source, Page, StringComparison.OrdinalIgnoreCase)) return;
        Dictionary<string, object> request;
        try
        {
            request = json.DeserializeObject(args.WebMessageAsJson) as Dictionary<string, object>;
        }
        catch (ArgumentException) { return; }
        catch (InvalidOperationException) { return; }
        if (request == null || !request.ContainsKey("id") || !(request["id"] is int)) return;
        requests.Enqueue(request);
        if (bridgeBusy) return;
        bridgeBusy = true;
        BeginInvoke((Action)ProcessRequests);
    }

    private async void ProcessRequests()
    {
        while (requests.Count > 0 && !IsDisposed)
        {
            var request = requests.Dequeue();
            var id = (int)request["id"];
            try
            {
                var value = StringValue(request, "method") == "exportDrawing"
                    ? await ExportDrawing(request) : Execute(request);
                Reply(new { id = id, ok = true, value = value });
            }
            catch (Exception error) { Reply(new { id = id, ok = false, error = error.Message }); }
        }
        bridgeBusy = false;
    }

    private void Reply(object response)
    {
        if (!IsDisposed && view.CoreWebView2 != null) view.CoreWebView2.PostWebMessageAsJson(json.Serialize(response));
    }

    private object Execute(Dictionary<string, object> request)
    {
        switch (StringValue(request, "method"))
        {
            case "setLanguage":
                var chosen = StringValue(request, "language");
                language = chosen == "en" || chosen == "ja" ? chosen : "vi";
                Text = WindowTitle + (dirty ? " *" : "");
                return language;
            case "copyText":
                var textToCopy = StringValue(request, "text");
                if (textToCopy != "nhanduc.business@gmail.com") throw new InvalidOperationException("Invalid email.");
                Clipboard.SetText(textToCopy);
                return null;
            case "openProject": return OpenProject();
            case "saveProject":
                object openPaths;
                request.TryGetValue("openPaths", out openPaths);
                return SaveProject(StringValue(request, "text"), StringValue(request, "path"), openPaths as System.Collections.IEnumerable);
            case "exportBomCsv": return ExportBomCsv(StringValue(request, "name"), StringValue(request, "text"));
            case "openExample": return OpenExample(StringValue(request, "slug"));
            case "confirmDiscard": return ConfirmDiscard();
            case "setDirty":
                dirty = request.ContainsKey("dirty") && request["dirty"] is bool && (bool)request["dirty"];
                Text = WindowTitle + (dirty ? " *" : "");
                return null;
            case "getRecovery":
                var recovery = Path.Combine(dataFolder, "recovery.json");
                return File.Exists(recovery) ? ReadText(recovery, RecoveryLimit) : null;
            case "setRecovery":
                var recoveryPath = Path.Combine(dataFolder, "recovery.json");
                var recoveryText = StringValue(request, "text");
                if (String.IsNullOrEmpty(recoveryText)) File.Delete(recoveryPath);
                else WriteAtomic(recoveryPath, recoveryText, RecoveryLimit);
                return null;
            default: throw new InvalidOperationException(Localized("Thao tác desktop không hợp lệ.", "Invalid desktop operation.", "デスクトップ操作が無効です。"));
        }
    }

    private object OpenProject()
    {
        if (verification != null) return ReadProject(verification.ProjectPath);
        using (var dialog = new OpenFileDialog { Title = Localized("Mở dự án tủ điện", "Open electrical project", "電気回路プロジェクトを開く"), Filter = FileFilter, CheckFileExists = true, RestoreDirectory = true })
        {
            return dialog.ShowDialog(this) == DialogResult.OK ? ReadProject(dialog.FileName) : null;
        }
    }

    private object ReadProject(string path)
    {
        var fullPath = Path.GetFullPath(path);
        var text = ReadText(fullPath);
        authorizedPaths.Add(fullPath);
        return new { text = text, path = fullPath };
    }

    private object SaveProject(string text, string path, System.Collections.IEnumerable openPaths)
    {
        if (String.IsNullOrEmpty(text)) throw new InvalidDataException(Localized("Dữ liệu dự án trống.", "Project data is empty.", "プロジェクトデータが空です。"));
        if (!String.IsNullOrEmpty(path))
        {
            path = Path.GetFullPath(path);
            if (!authorizedPaths.Contains(path)) throw new UnauthorizedAccessException(Localized("Hãy chọn vị trí lưu dự án qua Lưu thành.", "Choose a project location using Save as.", "名前を付けて保存で保存先を選択してください。"));
        }
        else if (verification != null)
        {
            path = File.Exists(verification.ProjectPath) ? verification.SaveAsPath : verification.ProjectPath;
        }
        else
        {
            using (var dialog = new SaveFileDialog { Title = Localized("Lưu dự án tủ điện", "Save electrical project", "電気回路プロジェクトを保存"), Filter = FileFilter, AddExtension = true,
                DefaultExt = "td2d.json", FileName = "Mach-tu-dien" + Extension, OverwritePrompt = true, RestoreDirectory = true })
            {
                if (dialog.ShowDialog(this) != DialogResult.OK) return null;
                path = dialog.FileName;
            }
            if (!Path.HasExtension(path)) path += Extension;
        }
        path = Path.GetFullPath(path);
        if (openPaths != null)
        {
            foreach (var entry in openPaths)
            {
                var openPath = entry as string;
                if (!String.IsNullOrEmpty(openPath) && String.Equals(path, Path.GetFullPath(openPath), StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException(Localized("Tệp này đang mở ở tab khác. Hãy chọn tên tệp khác.",
                        "This file is open in another tab. Choose a different file name.", "このファイルは別のタブで開いています。別のファイル名を選択してください。"));
            }
        }
        WriteAtomic(path, text);
        authorizedPaths.Add(path);
        return new { path = path };
    }

    private object OpenExample(string slug)
    {
        if (slug != "sump-pit" && slug != "smoke-exhaust" && slug != "pressure-control" && slug != "ats-panel") throw new InvalidOperationException(Localized("Không tìm thấy dự án mẫu.", "Example project not found.", "サンプルプロジェクトが見つかりません。"));
        return new { text = ReadText(Path.Combine(bundle, "examples", slug + Extension)), path = (string)null };
    }

    private object ExportBomCsv(string name, string text)
    {
        if (String.IsNullOrWhiteSpace(text)) throw new InvalidDataException(Localized("Dữ liệu CSV trống.", "CSV data is empty.", "CSVデータが空です。"));
        string path;
        if (verification != null) path = verification.BomCsvPath;
        else
        {
            var fileName = name ?? String.Empty;
            if (fileName.Length > 100) fileName = fileName.Substring(0, Char.IsHighSurrogate(fileName[99]) ? 99 : 100);
            foreach (var invalid in Path.GetInvalidFileNameChars()) fileName = fileName.Replace(invalid, '_');
            fileName = fileName.Trim(' ', '.');
            using (var dialog = new SaveFileDialog {
                Title = Localized("Xuất bảng kê vật tư CSV", "Export bill of materials CSV", "部品表をCSVに出力"),
                Filter = Localized("Tệp CSV", "CSV files", "CSVファイル") + " (*.csv)|*.csv",
                FileName = (fileName.Length == 0 ? "BOM" : "BOM_" + fileName) + ".csv",
                DefaultExt = "csv", AddExtension = true, OverwritePrompt = true, RestoreDirectory = true
            })
            {
                if (dialog.ShowDialog(this) != DialogResult.OK) return null;
                path = dialog.FileName;
            }
        }
        if (!String.Equals(Path.GetExtension(path), ".csv", StringComparison.OrdinalIgnoreCase))
            throw new InvalidDataException(Localized("Hãy chọn tên tệp có đuôi .csv.", "Choose a file name ending in .csv.", "拡張子が .csv のファイル名を選択してください。"));
        WriteAtomic(path, text[0] == '\uFEFF' ? text : "\uFEFF" + text);
        return new { path = path };
    }

    private bool ConfirmDiscard()
    {
        return !dirty || verification != null || MessageBox.Show(this,
            Localized("Có dự án chưa lưu. Tiếp tục và bỏ các thay đổi chưa lưu?",
                "There are unsaved projects. Continue and discard your unsaved changes?",
                "未保存のプロジェクトがあります。変更を破棄して続行しますか？"), WindowTitle,
            MessageBoxButtons.YesNo, MessageBoxIcon.Warning, MessageBoxDefaultButton.Button2) == DialogResult.Yes;
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        if (!ConfirmDiscard()) e.Cancel = true;
        else if (dirty && verification == null)
        {
            try { File.Delete(Path.Combine(dataFolder, "recovery.json")); }
            catch (IOException) { }
            catch (UnauthorizedAccessException) { }
        }
        base.OnFormClosing(e);
    }

    private async void NavigationCompleted(object sender, CoreWebView2NavigationCompletedEventArgs args)
    {
        if (verification == null)
        {
            if (!args.IsSuccess)
            {
                MessageBox.Show(this, "Không tải được giao diện cục bộ. Mã lỗi " + args.WebErrorStatus + ".",
                    TitleText, MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
            }
            return;
        }
        if (verified) return;
        verified = true;
        try
        {
            if (!args.IsSuccess) throw new InvalidOperationException("Không tải được giao diện offline: " + args.WebErrorStatus);
            await verification.Run(view.CoreWebView2, ReadResource("desktop-smoke.js"));
        }
        catch (Exception error) { verification.WriteFailure(error); }
        finally { Close(); }
    }

    private static string StringValue(Dictionary<string, object> data, string key)
    {
        object value;
        return data.TryGetValue(key, out value) ? value as string : null;
    }

    private string ReadText(string path, int maxBytes = FileLimit)
    {
        var file = new FileInfo(path);
        if (!file.Exists) throw new FileNotFoundException(Localized("Không tìm thấy tệp ", "File not found — ", "ファイルが見つかりません — ") + file.Name + ".");
        if (file.Length > maxBytes) throw new InvalidDataException(SizeLimitMessage(maxBytes));
        return File.ReadAllText(path, Utf8);
    }

    private void WriteAtomic(string path, string text, int maxBytes = FileLimit)
    {
        if (Utf8.GetByteCount(text) > maxBytes) throw new InvalidDataException(SizeLimitMessage(maxBytes));
        var temporary = Path.Combine(Path.GetDirectoryName(path), Guid.NewGuid().ToString("N") + ".tmp");
        try
        {
            using (var file = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                var bytes = Utf8.GetBytes(text);
                file.Write(bytes, 0, bytes.Length);
                file.Flush(true);
            }
            if (File.Exists(path)) File.Replace(temporary, path, null);
            else File.Move(temporary, path);
        }
        finally { if (File.Exists(temporary)) File.Delete(temporary); }
    }

    private string SizeLimitMessage(int maxBytes)
    {
        return maxBytes == FileLimit
            ? Localized("Dữ liệu dự án vượt quá 10 MB.", "Project data exceeds 10 MB.", "プロジェクトデータが10 MBを超えています。")
            : Localized("Dữ liệu khôi phục vượt quá 128 MB.", "Recovery data exceeds 128 MB.", "復旧データが128 MBを超えています。");
    }

    private static string ReadResource(string name)
    {
        using (var source = Assembly.GetExecutingAssembly().GetManifestResourceStream(name))
        using (var reader = new StreamReader(source, Utf8)) return reader.ReadToEnd();
    }
}
