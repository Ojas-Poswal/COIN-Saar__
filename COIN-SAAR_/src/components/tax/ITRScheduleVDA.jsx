import { FileText, Info } from "lucide-react";

export default function ITRScheduleVDA({ taxData, financialYear }) {
  const rows = taxData.assetBreakdown || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gray-900 border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-b border-orange-500/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-bold text-white">ITR Schedule VDA</h3>
              <p className="text-xs text-gray-400">Virtual Digital Assets — Income from Transfer | FY {financialYear}</p>
            </div>
          </div>
        </div>

        {/* Legal Note */}
        <div className="px-6 py-3 bg-blue-500/5 border-b border-gray-800 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300">
            As per Section 115BBH of the Income Tax Act, 1961 — income from transfer of VDAs is taxable at <strong>flat 30%</strong> (plus applicable surcharge and cess). Loss from one VDA cannot be set off against profit from another VDA or any other income head.
          </p>
        </div>

        {/* Asset-wise Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">VDA Name</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Type</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Sale Consideration (₹)</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Cost of Acquisition (₹)</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Net Income / Loss (₹)</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Tax @ 30% (₹)</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">TDS Deducted (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-medium">{row.symbol}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">{row.type}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {row.saleConsideration?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {row.costOfAcquisition?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${row.netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {row.netIncome >= 0 ? "+" : ""}{row.netIncome?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-red-400">
                    {row.tax?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-400">
                    {row.tds?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No sell transactions for this period</td>
                </tr>
              )}
            </tbody>
            {/* Totals row */}
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-gray-800 border-t-2 border-orange-500/40 font-semibold">
                  <td className="px-4 py-3 text-white" colSpan={2}>TOTAL</td>
                  <td className="px-4 py-3 text-right text-white">
                    {rows.reduce((s, r) => s + (r.saleConsideration || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {rows.reduce((s, r) => s + (r.costOfAcquisition || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {rows.reduce((s, r) => s + (r.netIncome || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-red-400">
                    {rows.reduce((s, r) => s + (r.tax || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-400">
                    {rows.reduce((s, r) => s + (r.tds || 0), 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Important Notes */}
      <div className="rounded-xl bg-gray-900 border border-gray-700 p-5">
        <h4 className="font-semibold text-white text-sm mb-3">Important Notes for Filing ITR</h4>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>Report VDA income under Schedule VDA in ITR-2 or ITR-3</li>
          <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>Loss from VDA cannot be set off against any other income (Section 115BBH(2)(b))</li>
          <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>No deductions allowed except Cost of Acquisition (no expenses, depreciation, etc.)</li>
          <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>TDS deducted by exchange appears in Form 26AS — reconcile before filing</li>
          <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>Gift of VDA exceeding ₹50,000 in a year is taxable in hands of recipient</li>
          <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>Advance tax applicable if total tax liability exceeds ₹10,000</li>
        </ul>
      </div>
    </div>
  );
}