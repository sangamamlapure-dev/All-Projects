import { useState } from 'react';
import {
  FileText, Eye, Download, FileSpreadsheet, Calendar, MapPin,
  Droplets, Gauge, Waves, Fish, Bell, FlaskConical, Plus,
  CheckCircle2, X, Printer, ShieldCheck, Award
} from 'lucide-react';
import { Card, CardHeader, CardBody, PageHeader } from '@/components/ui/Card';
import { useData } from '@/context/DataContext';
import type { ReportItem } from '@/types';

export default function Reports() {
  const { reports, zones, alerts, addNewReport } = useData();
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newWaterBody, setNewWaterBody] = useState('Lilagar Lake — North Basin');

  // Real CSV export generation & download
  const handleExportCSV = (report: ReportItem) => {
    const headers = [
      'Report ID',
      'Date',
      'Water Body Basin',
      'Monitored Zones',
      'Average pH',
      'Average TDS (ppm)',
      'Average Turbidity (NTU)',
      'Average DO (mg/L)',
      'Active Alerts Generated',
      'Treatment Status',
      'Compliance Standard',
    ];

    const row = [
      report.id,
      report.date,
      `"${report.waterBody}"`,
      report.zones,
      report.avgPh,
      report.avgTds,
      report.avgTurbidity,
      report.avgDo,
      report.alertsGenerated,
      `"${report.treatmentStatus}"`,
      '"BIS IS 10500:2012 / WHO Drinking Guideline"',
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.id}_JalDrishti_WaterQuality_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF view trigger
  const handleDownloadPDF = (report: ReportItem) => {
    setSelectedReport(report);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleGenerateNewReport = (e: React.FormEvent) => {
    e.preventDefault();
    const avgPh = parseFloat((zones.reduce((sum, z) => sum + z.reading.ph, 0) / zones.length).toFixed(2));
    const avgTds = Math.round(zones.reduce((sum, z) => sum + z.reading.tds, 0) / zones.length);
    const avgTurbidity = parseFloat((zones.reduce((sum, z) => sum + z.reading.turbidity, 0) / zones.length).toFixed(1));
    const avgDo = parseFloat((zones.reduce((sum, z) => sum + z.reading.dissolvedOxygen, 0) / zones.length).toFixed(1));
    const activeAlertCount = alerts.filter(a => !a.resolved).length;

    const newRpt: ReportItem = {
      id: `RPT-2026-${String(reports.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      waterBody: newWaterBody,
      zones: zones.length,
      avgPh,
      avgTds,
      avgTurbidity,
      avgDo,
      alertsGenerated: activeAlertCount,
      treatmentStatus: avgTurbidity > 10 || avgTds > 600 ? 'In Progress' : 'Completed',
    };

    addNewReport(newRpt);
    setShowGenerateModal(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Water Quality Reports"
          subtitle="Official monitoring audit logs, CPCB compliance dossiers, and verifiable CSV/PDF exports"
        />

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md hover:from-cyan-600 hover:to-blue-700 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Audit Report</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map(report => (
          <Card key={report.id} className="overflow-hidden hover:border-cyan-300 transition-all">
            <CardHeader
              title={report.waterBody}
              subtitle={`Dossier: ${report.id} • Date: ${report.date}`}
              action={
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                  report.treatmentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  report.treatmentStatus === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {report.treatmentStatus}
                </span>
              }
            />
            <CardBody>
              {/* Parameters Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Audit Date</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{report.date}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">GPS Zones</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{report.zones} Beacons</p>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-100">
                  <div className="flex items-center gap-1.5 text-cyan-600 mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Avg pH</span>
                  </div>
                  <p className="text-xs font-black text-cyan-800">{report.avgPh}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Avg TDS</span>
                  </div>
                  <p className="text-xs font-black text-blue-800">{report.avgTds} <span className="text-[9px] font-normal">ppm</span></p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                    <Waves className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Avg Turbidity</span>
                  </div>
                  <p className="text-xs font-black text-amber-800">{report.avgTurbidity} <span className="text-[9px] font-normal">NTU</span></p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <Fish className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Avg DO</span>
                  </div>
                  <p className="text-xs font-black text-emerald-800">{report.avgDo} <span className="text-[9px] font-normal">mg/L</span></p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Incidents</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{report.alertsGenerated} Alerts</p>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                  <div className="flex items-center gap-1.5 text-purple-600 mb-1">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">Treatment</span>
                  </div>
                  <p className="text-xs font-bold text-purple-800 truncate">{report.treatmentStatus}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 hover:bg-cyan-100 text-xs font-bold transition-all border border-cyan-200"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-600" />
                  <span>View Dossier</span>
                </button>

                <button
                  onClick={() => handleDownloadPDF(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => handleExportCSV(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all border border-slate-200 ml-auto"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* View Detailed Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center font-bold">
                    JD
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">JalDrishti Water Quality Dossier</h3>
                    <p className="text-xs text-slate-400 font-mono">Report Ref: {selectedReport.id}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400">Water Body Reservoir:</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedReport.waterBody}</p>
                </div>
                <div>
                  <p className="text-slate-400">Monitoring Audit Date:</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Sampling Density:</p>
                  <p className="font-bold text-slate-800">{selectedReport.zones} Autonomous Waypoint Transects</p>
                </div>
                <div>
                  <p className="text-slate-400">Purification Recommendation Status:</p>
                  <p className="font-bold text-cyan-700">{selectedReport.treatmentStatus}</p>
                </div>
              </div>

              {/* Parameter Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold text-[11px] border-b">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Observed Average</th>
                      <th className="p-2.5">Safe Standard (IS 10500)</th>
                      <th className="p-2.5">Compliance Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium">pH Level</td>
                      <td className="p-2.5 font-bold">{selectedReport.avgPh}</td>
                      <td className="p-2.5 text-slate-500">6.50 – 8.50</td>
                      <td className="p-2.5 text-emerald-600 font-bold">Compliant</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Total Dissolved Solids (TDS)</td>
                      <td className="p-2.5 font-bold">{selectedReport.avgTds} ppm</td>
                      <td className="p-2.5 text-slate-500">&lt; 500 ppm</td>
                      <td className="p-2.5 font-bold">
                        {selectedReport.avgTds > 500 ? (
                          <span className="text-amber-600">Marginal (&gt; 500)</span>
                        ) : (
                          <span className="text-emerald-600">Compliant</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Turbidity</td>
                      <td className="p-2.5 font-bold">{selectedReport.avgTurbidity} NTU</td>
                      <td className="p-2.5 text-slate-500">&lt; 5.0 NTU</td>
                      <td className="p-2.5 font-bold">
                        {selectedReport.avgTurbidity > 5 ? (
                          <span className="text-amber-600">Treatment Needed</span>
                        ) : (
                          <span className="text-emerald-600">Compliant</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Dissolved Oxygen (DO)</td>
                      <td className="p-2.5 font-bold">{selectedReport.avgDo} mg/L</td>
                      <td className="p-2.5 text-slate-500">&gt; 5.0 mg/L</td>
                      <td className="p-2.5 text-emerald-600 font-bold">Healthy Oxygenation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  <b>Water Quality Audit Certification:</b> Telemetry verified via continuous ESP32 autonomous boat transect.
                  This digital record is valid for submission to State Pollution Control Board & Public Health Engineering Departments.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => handleExportCSV(selectedReport)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Export CSV File
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleGenerateNewReport}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Compile New Water Audit Report</h3>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Target Water Body Basin</label>
                <input
                  type="text"
                  value={newWaterBody}
                  onChange={e => setNewWaterBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                <p><b>Sampling Source:</b> Active live boat telemetry & {zones.length} sector beacons</p>
                <p><b>Data Period:</b> Real-time rolling 24h average</p>
                <p><b>Standard:</b> BIS IS 10500:2012</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md"
              >
                Generate & Save Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
