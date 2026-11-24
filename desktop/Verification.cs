using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using Microsoft.Web.WebView2.Core;

internal sealed class Verification
{
    private readonly JavaScriptSerializer json = new JavaScriptSerializer();
    internal readonly string Folder;
    internal string ProjectPath { get { return Path.Combine(Folder, "ui-roundtrip.td2d.json"); } }
    internal string SaveAsPath { get { return Path.Combine(Folder, "ui-save-as.td2d.json"); } }
    internal string BomCsvPath { get { return Path.Combine(Folder, "ui-bom.csv"); } }
    internal int ExitCode { get; private set; }

    internal Verification(string folder)
    {
        Folder = Path.Combine(folder, "verification-" + Guid.NewGuid().ToString("N"));
        ExitCode = 1;
    }

    internal async Task Run(CoreWebView2 core, string script)
    {
        var browser = core.Environment.BrowserVersionString;
        await core.ExecuteScriptAsync(script);
        var deadline = DateTime.UtcNow.AddSeconds(35);
        while (DateTime.UtcNow < deadline)
        {
            var raw = await core.ExecuteScriptAsync("window.desktopVerification || null");
            var result = json.DeserializeObject(raw) as Dictionary<string, object>;
            if (result != null)
            {
                result["webView2"] = browser;
                result["windows"] = Environment.OSVersion.Version.ToString();
                result["projectFileWritten"] = File.Exists(ProjectPath);
                result["bomCsvFileWritten"] = File.Exists(BomCsvPath);
                if ((bool)result["ok"])
                {
                    if (!File.Exists(ProjectPath) || !File.Exists(SaveAsPath))
                        throw new InvalidOperationException("Thiếu tệp từ thao tác Lưu hoặc Lưu thành.");
                    if (File.ReadAllText(ProjectPath) != File.ReadAllText(SaveAsPath))
                        throw new InvalidOperationException("Tệp từ thao tác Lưu thành có nội dung khác dự án đã lưu.");
                    var checks = new List<object>();
                    foreach (var check in (System.Collections.IEnumerable)result["checks"]) checks.Add(check);
                    checks.Add("Lưu thành tạo tệp thứ hai có nội dung đúng trên đĩa");
                    VerifyBomCsv((int)result["bomRowCount"], (int)result["bomQuantity"], checks);
                    result["checks"] = checks;
                }
                WriteReport(result);
                ExitCode = (bool)result["ok"] ? 0 : 1;
                return;
            }
            await Task.Delay(100);
        }
        throw new TimeoutException("Giao diện chưa trả kết quả trong 35 giây.");
    }

    private void VerifyBomCsv(int expectedRows, int expectedQuantity, List<object> checks)
    {
        if (!File.Exists(BomCsvPath)) throw new InvalidOperationException("Thiếu tệp CSV xuất từ bảng kê vật tư.");
        var bytes = File.ReadAllBytes(BomCsvPath);
        if (bytes.Length < 4 || bytes[0] != 0xEF || bytes[1] != 0xBB || bytes[2] != 0xBF)
            throw new InvalidOperationException("CSV xuất từ bảng kê vật tư thiếu dấu nhận diện UTF-8 BOM.");
        var csv = new UTF8Encoding(false, true).GetString(bytes, 3, bytes.Length - 3);
        var rows = csv.TrimEnd('\r', '\n').Split(new[] { "\r\n" }, StringSplitOptions.None);
        const string cell = "(?:\"(?:[^\"]|\"\")*\"|[^,\"]*)";
        var materialRow = new Regex("^(?:" + cell + ",){7}(?<quantity>[1-9][0-9]*)$");
        if (rows.Length != expectedRows + 1 || rows[0] != "STT,Tag,Tên thiết bị,Nhóm,Hãng / Mã hiệu,Thông số,Số chân,Số lượng")
            throw new InvalidOperationException("CSV thiếu tiêu đề tiếng Việt hoặc có số dòng khác bảng kê vật tư.");
        var total = 0;
        var grouped = false;
        for (int index = 1; index < rows.Length; index++)
        {
            var match = materialRow.Match(rows[index]);
            if (!match.Success) throw new InvalidOperationException("CSV bảng kê vật tư có dòng khác tám cột hoặc số lượng không hợp lệ.");
            var quantity = Int32.Parse(match.Groups["quantity"].Value);
            grouped |= quantity > 1;
            total += quantity;
        }
        if (!grouped || total != expectedQuantity) throw new InvalidOperationException("Số lượng CSV không khớp bảng kê vật tư.");
        checks.Add("CSV trên đĩa có UTF-8 BOM, tám cột và số lượng vật tư khớp bảng kê");
        if (!csv.Contains(",\"K,\"\"ĐK\"\"\",") || !csv.Contains(",'=2+3,"))
            throw new InvalidOperationException("CSV chưa thoát dấu phẩy, dấu nháy hoặc bảo vệ tag dạng công thức.");
        checks.Add("CSV thoát chính xác tag có dấu phẩy và ngoặc kép, giữ tag dạng công thức ở dạng văn bản");
    }

    internal void WriteFailure(Exception error)
    {
        WriteReport(new { ok = false, error = error.ToString() });
    }

    private void WriteReport(object result)
    {
        Directory.CreateDirectory(Folder);
        File.WriteAllText(Path.Combine(Folder, "result.json"), json.Serialize(result), new UTF8Encoding(false));
    }
}
