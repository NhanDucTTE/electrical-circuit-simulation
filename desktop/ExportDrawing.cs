using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using ACadSharp;
using ACadSharp.Entities;
using ACadSharp.IO;
using ACadSharp.Tables;
using ACadSharp.Types.Units;
using CSMath;
using Microsoft.Web.WebView2.Core;

internal sealed partial class DesktopWindow
{
    private async Task<object> ExportDrawing(Dictionary<string, object> request)
    {
        var format = StringValue(request, "format");
        if (format != "pdf" && format != "dwg") throw new InvalidDataException("Định dạng bản vẽ không hợp lệ.");
        var name = StringValue(request, "name") ?? "Sơ đồ nguyên lý";
        var suggested = String.Concat(name.Take(100).Select(c => Path.GetInvalidFileNameChars().Contains(c) ? '_' : c)).Trim(' ', '.');
        string path;
        if (verification != null) path = Path.Combine(verification.Folder, "so-do." + format);
        else using (var dialog = new SaveFileDialog {
            Title = Localized("Xuất bản vẽ ", "Export drawing ", "図面出力 ") + format.ToUpperInvariant(), Filter = format == "pdf" ? "PDF (*.pdf)|*.pdf" : "AutoCAD DWG (*.dwg)|*.dwg",
            DefaultExt = format, AddExtension = true, OverwritePrompt = true, RestoreDirectory = true,
            FileName = (String.IsNullOrEmpty(suggested) ? "So-do" : suggested) + "." + format })
        {
            if (dialog.ShowDialog(this) != DialogResult.OK) return null;
            path = dialog.FileName;
        }
        if (!String.Equals(Path.GetExtension(path), "." + format, StringComparison.OrdinalIgnoreCase))
            throw new InvalidDataException("Hãy chọn tên tệp có đuôi ." + format + ".");
        var temp = Path.Combine(Path.GetDirectoryName(path), Guid.NewGuid().ToString("N") + "." + format);
        try
        {
            if (format == "pdf")
            {
                var settings = view.CoreWebView2.Environment.CreatePrintSettings();
                settings.Orientation = CoreWebView2PrintOrientation.Landscape;
                settings.PageWidth = 297.0 / 25.4;
                settings.PageHeight = 420.0 / 25.4;
                settings.MarginLeft = settings.MarginRight = settings.MarginTop = settings.MarginBottom = 0;
                settings.ShouldPrintHeaderAndFooter = false;
                settings.ShouldPrintBackgrounds = true;
                if (!await view.CoreWebView2.PrintToPdfAsync(temp, settings))
                    throw new IOException("WebView2 chưa ghi được bản vẽ PDF.");
            }
            else
            {
                var scene = request["scene"] as Dictionary<string, object>;
                await Task.Run(() => CadDrawing.Write(temp, name, scene, verification != null));
            }
            if (File.Exists(path)) File.Replace(temp, path, null);
            else File.Move(temp, path);
            return new { path = path };
        }
        finally { if (File.Exists(temp)) File.Delete(temp); }
    }
}

internal static class CadDrawing
{
    private static readonly string[] Layers = { "DAY-DAN", "THIET-BI", "DAU-NOI", "CHU" };

    private static double Number(object value)
    {
        if (value == null) throw new InvalidDataException("Thiếu tọa độ bản vẽ.");
        var number = Convert.ToDouble(value, CultureInfo.InvariantCulture);
        if (Double.IsNaN(number) || Double.IsInfinity(number)) throw new InvalidDataException("Tọa độ bản vẽ không hợp lệ.");
        return number;
    }

    private static XYZ Point(object[] data, int offset)
    {
        return new XYZ(Number(data[offset]), -Number(data[offset + 1]), 0);
    }

    // Each row holds kind, layer and its geometry, with coordinates in the editor's world space.
    private static Entity ReadEntity(object[] row, TextStyle font)
    {
        switch ((string)row[0])
        {
            case "text":
                return new TextEntity { InsertPoint = Point(row, 2), Height = Number(row[4]), Rotation = -Number(row[5]),
                    Value = (string)row[6], Style = font };
            case "circle":
                return new Circle(Point(row, 2), Number(row[4]));
            case "dot":
                var radius = Number(row[4]);
                var center = Point(row, 2);
                var dot = new LwPolyline { IsClosed = true, ConstantWidth = radius };
                dot.Vertices.Add(new LwPolyline.Vertex(center.X - radius / 2, center.Y) { Bulge = 1 });
                dot.Vertices.Add(new LwPolyline.Vertex(center.X + radius / 2, center.Y) { Bulge = 1 });
                return dot;
            case "path":
                var coords = (object[])row[4];
                if (coords.Length < 4 || coords.Length % 2 != 0) throw new InvalidDataException("Đường bản vẽ không hợp lệ.");
                if (coords.Length == 4) return new Line(Point(coords, 0), Point(coords, 2));
                var poly = new LwPolyline { IsClosed = (bool)row[2] };
                for (int i = 0; i < coords.Length; i += 2)
                    poly.Vertices.Add(new LwPolyline.Vertex(Number(coords[i]), -Number(coords[i + 1])));
                return poly;
            default: throw new InvalidDataException("Kiểu hình học bản vẽ không hợp lệ.");
        }
    }

    internal static void Write(string path, string title, Dictionary<string, object> scene, bool verify)
    {
        if (scene == null) throw new InvalidDataException("Thiếu hình học bản vẽ.");
        var rows = (object[])scene["entities"];
        if (rows.Length == 0) throw new InvalidDataException("Sơ đồ chưa có phần tử để xuất.");
        var bounds = (object[])scene["bounds"];
        var x = Number(bounds[0]);
        var y = Number(bounds[1]);
        var width = Number(bounds[2]);
        var height = Number(bounds[3]);
        var doc = new CadDocument(ACadVersion.AC1027);
        doc.SummaryInfo.Title = title;
        doc.Header.InsUnits = UnitsType.Unitless;
        doc.Header.ModelSpaceExtMin = new XYZ(x, -y-height, 0);
        doc.Header.ModelSpaceExtMax = new XYZ(x+width, -y, 0);
        var vp = doc.VPorts["*Active"];
        vp.AspectRatio = 1.5;
        vp.Center = new XY(x + width / 2, -y - height / 2);
        vp.ViewHeight = Math.Max(height, width / vp.AspectRatio) * 1.06;
        vp.ShowGrid = false;
        foreach (var layer in Layers) doc.Layers.Add(new Layer(layer));
        var font = new TextStyle("CHU-VI") { Filename = "arial.ttf" };
        doc.TextStyles.Add(font);
        var dashed = new LineType("NET-DUT");
        dashed.AddSegment(new LineType.Segment { Length = 3 });
        dashed.AddSegment(new LineType.Segment { Length = -2 });
        doc.LineTypes.Add(dashed);
        foreach (object[] row in rows)
        {
            var entity = ReadEntity(row, font);
            entity.Layer = doc.Layers[(string)row[1]];
            if ((string)row[0] == "path" && (bool)row[3]) entity.LineType = dashed;
            doc.Entities.Add(entity);
        }
        DwgWriter.Write(path, doc);
        if (verify)
        {
            var read = DwgReader.Read(path);
            var before = doc.Entities.OfType<TextEntity>().Select(t => t.Value).OrderBy(v => v).ToArray();
            var after = read.Entities.OfType<TextEntity>().Select(t => t.Value).OrderBy(v => v).ToArray();
            if (read.Entities.Count != rows.Length || !before.SequenceEqual(after) || read.Header.Version != ACadVersion.AC1027)
                throw new InvalidDataException("Đọc lại DWG không khớp hình học hoặc nhãn của sơ đồ.");
        }
    }
}
