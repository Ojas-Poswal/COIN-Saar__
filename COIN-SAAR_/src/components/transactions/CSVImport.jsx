import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CURRENT_FY = () => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
};

export default function CSVImport({ onImported, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const parseCSV = async () => {
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                asset_symbol: { type: "string" },
                asset_name: { type: "string" },
                asset_type: { type: "string" },
                transaction_type: { type: "string" },
                quantity: { type: "number" },
                price_per_unit_inr: { type: "number" },
                total_value_inr: { type: "number" },
                fee_inr: { type: "number" },
                tds_deducted_inr: { type: "number" },
                platform: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (extracted.status === "success") {
      const txs = (extracted.output?.transactions || []).map(t => ({
        ...t,
        financial_year: CURRENT_FY(),
        asset_type: t.asset_type || "Crypto",
        transaction_type: t.transaction_type || "Buy",
        fee_inr: t.fee_inr || 0,
        tds_deducted_inr: t.tds_deducted_inr || 0,
      }));
      setPreview(txs);
    } else {
      setResult({ error: extracted.details || "Failed to parse CSV" });
    }
    setLoading(false);
  };

  const confirmImport = async () => {
    setLoading(true);
    await base44.entities.Transaction.bulkCreate(preview);
    setResult({ success: preview.length });
    onImported();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Import CSV Transactions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!result && (
            <>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-xs text-orange-300">
                <p className="font-semibold mb-1">Supported formats:</p>
                <p>CSV files exported from WazirX, CoinDCX, CoinSwitch, ZebPay, Binance, or any exchange. Columns: date, asset, type, quantity, price, total, fee.</p>
              </div>

              {!preview && (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-3">Upload your exchange CSV file</p>
                  <input type="file" accept=".csv,.xlsx" onChange={handleFile} className="hidden" id="csv-upload" />
                  <label htmlFor="csv-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
                    Choose File
                  </label>
                  {file && <p className="mt-2 text-xs text-green-400">{file.name}</p>}
                </div>
              )}

              {file && !preview && (
                <Button onClick={parseCSV} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {loading ? "Parsing..." : "Parse & Preview"}
                </Button>
              )}

              {preview && (
                <>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-300">
                    Found <strong>{preview.length}</strong> transactions. Review below and confirm import.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {["Date", "Asset", "Type", "Qty", "Price (₹)", "Total (₹)", "Platform"].map(h => (
                            <th key={h} className="text-left px-2 py-2 text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 20).map((t, i) => (
                          <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="px-2 py-1.5 text-gray-300">{t.date?.slice(0, 10)}</td>
                            <td className="px-2 py-1.5 text-white font-medium">{t.asset_symbol}</td>
                            <td className="px-2 py-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${t.transaction_type === "Sell" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                {t.transaction_type}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-gray-300">{t.quantity}</td>
                            <td className="px-2 py-1.5 text-gray-300">{t.price_per_unit_inr?.toFixed(2)}</td>
                            <td className="px-2 py-1.5 text-white">{t.total_value_inr?.toFixed(2)}</td>
                            <td className="px-2 py-1.5 text-gray-400">{t.platform}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.length > 20 && <p className="text-xs text-gray-500 text-center py-2">...and {preview.length - 20} more</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPreview(null)} className="flex-1 border-gray-700 text-gray-300">
                      Re-upload
                    </Button>
                    <Button onClick={confirmImport} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                      {loading ? "Importing..." : `Import ${preview.length} Transactions`}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {result?.success && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Imported {result.success} transactions successfully!</p>
              <Button onClick={onClose} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">Done</Button>
            </div>
          )}

          {result?.error && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Import failed</p>
              <p className="text-gray-400 text-sm mt-1">{result.error}</p>
              <Button onClick={() => { setResult(null); setFile(null); setPreview(null); }} className="mt-4 bg-gray-700 text-white">Try Again</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}