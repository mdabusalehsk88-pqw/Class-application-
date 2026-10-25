import React from 'react';
import { StudentGradeCard } from '../../types';
import { Printer, Download, X, Award, CheckCircle } from 'lucide-react';
import { calculatePerformanceLevel } from '../../data/gradeCardData';

interface GradeCardTemplateProps {
  card: StudentGradeCard;
  onClose?: () => void;
  onPrint?: () => void;
  hideControls?: boolean;
}

export const GradeCardTemplate: React.FC<GradeCardTemplateProps> = ({
  card,
  onClose,
  onPrint,
  hideControls = false
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadHtml = () => {
    const el = document.getElementById(`grade-card-${card.id}`);
    if (!el) return;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Grade Card - ${card.studentName} (${card.admissionNo})</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 3px 5px; font-size: 11px; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
  </style>
</head>
<body>
  ${el.outerHTML}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GradeCard_${card.admissionNo}_${card.studentName.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Action Controls Bar (Hidden during Print) */}
      {!hideControls && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Award size={18} className="text-emerald-400" />
            <span>Official University Grade Card (PDF Template Replica)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Download HTML File"
            >
              <Download size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Download HTML</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
              title="Print Official Document"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/30"
                title="Close Grade Card Preview"
              >
                <X size={14} />
                <span>Close [✕]</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EXACT GRADE CARD REPLICA MATCHING THE USER'S ATTACHED PDF      */}
      {/* ============================================================== */}
      <div
        id={`grade-card-${card.id}`}
        className="bg-white text-black p-5 sm:p-7 border-2 border-black max-w-[850px] mx-auto shadow-2xl print:border-2 print:border-black print:shadow-none print:p-4 print:m-0 print:max-w-none text-[11px] leading-tight select-text"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* Top University Header */}
        <div className="text-center space-y-1 pb-2">
          <div className="flex items-center justify-between px-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
              DARUL HUDA ISLAMIC UNIVERSITY
            </h1>

            {/* University Crest / Emblem */}
            <div className="w-12 h-12 rounded-full border-2 border-emerald-700 p-0.5 flex items-center justify-center bg-emerald-50 shrink-0 mx-2 shadow-xs">
              <div className="w-full h-full rounded-full border border-amber-600 flex flex-col items-center justify-center text-[8px] font-bold text-emerald-900 leading-none">
                <span>DHIU</span>
                <span className="text-[10px]">⚖️</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif" dir="rtl">
              جامعة دار الهدى الإسلامية
            </h1>
          </div>

          <div className="text-[10px] italic text-slate-800 font-medium">
            (Member: League of the Islamic Universities, Cairo & Federation of the Universities of the Islamic World, Morocco)
          </div>
          <div className="text-[9px] text-slate-700">
            Hidaya Nagar, Chemmad, Tirurangadi P.O, Malappuram Dt., Kerala, PIN:676 306, Ph: 0495-2463155
          </div>
        </div>

        {/* Green Banner: Academic Year | GRADE CARD | Issued Date */}
        <div className="bg-[#78c257] text-black px-3 py-1 flex items-center justify-between text-xs font-bold border border-black my-1">
          <div className="italic text-[#8b1414] font-serif font-bold text-[11px]">
            Academic Year:{card.academicYear || '2026-2027'}
          </div>

          <div className="text-white text-base font-black tracking-widest uppercase">
            GRADE CARD
          </div>

          <div className="italic text-[#8b1414] font-serif text-[10px]">
            Issued Date : {card.issuedDate || '10/20/2026 9:14:51 PM'}
          </div>
        </div>

        {/* Examination Title */}
        <div className="text-center font-bold text-xs py-1.5 uppercase tracking-wide">
          {card.examTitle || 'SEC. FOURTH YEAR HALF YEARLY EXAMINATION - AUG-2026'}
        </div>

        {/* Student Details Box with Photo on Right */}
        <div className="border border-black p-2 my-1 grid grid-cols-12 gap-2 items-center text-[11px]">
          <div className="col-span-9 space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Ad. No : </strong>
                <span>{card.admissionNo}</span>
              </div>
              <div>
                <strong>Enrl.No : </strong>
                <span>{card.enrollmentNo || '0'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Name: </strong>
                <span className="font-bold">{card.studentName}</span>
              </div>
              <div>
                <strong>Date of Birth: </strong>
                <span>{card.dateOfBirth || '27-May-2011'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Standard: </strong>
                <span>{card.standard || 'Secondary Fourth Year'}</span>
              </div>
              <div>
                <strong>Division: </strong>
                <span>{card.division || 'A'}</span>
              </div>
            </div>
          </div>

          {/* Student Photo */}
          <div className="col-span-3 flex justify-end">
            <div className="w-18 h-22 border border-black p-0.5 bg-white shadow-xs">
              <img
                src={card.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={card.studentName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 17 Subjects Table (Exact match of PDF columns and grid) */}
        <div className="overflow-x-auto my-1.5">
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-black font-bold">
                <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-8">
                  SI.NO
                </th>
                <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-20">
                  Subject Code
                </th>
                <th rowSpan={2} className="border border-black px-2 py-1 text-left">
                  Subjects
                </th>
                <th colSpan={2} className="border border-black px-1.5 py-1 text-center">
                  SA
                </th>
                <th colSpan={2} className="border border-black px-1.5 py-1 text-center">
                  FA
                </th>
                <th colSpan={4} className="border border-black px-1.5 py-1 text-center">
                  Total
                </th>
              </tr>
              <tr className="bg-slate-100 text-black font-bold text-[9px]">
                {/* SA */}
                <th className="border border-black px-1 py-0.5 text-center w-12">Scored</th>
                <th className="border border-black px-1 py-0.5 text-center w-14">Max.Mark</th>
                {/* FA */}
                <th className="border border-black px-1 py-0.5 text-center w-12">Scored</th>
                <th className="border border-black px-1 py-0.5 text-center w-14">Max.Mark</th>
                {/* Total */}
                <th className="border border-black px-1 py-0.5 text-center w-12">Scored</th>
                <th className="border border-black px-1 py-0.5 text-center w-14">Max.Mark</th>
                <th className="border border-black px-1 py-0.5 text-center w-10">Grade</th>
                <th className="border border-black px-1 py-0.5 text-center w-12">Average</th>
              </tr>
            </thead>
            <tbody>
              {card.subjects.map((s, idx) => (
                <tr key={s.slNo || idx} className="hover:bg-slate-50">
                  <td className="border border-black px-1.5 py-0.5 text-center">{s.slNo || idx + 1}</td>
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">{s.subjectCode || ''}</td>
                  <td className="border border-black px-2 py-0.5 font-medium">{s.subjectName}</td>

                  {/* SA */}
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">
                    {s.saScored !== null ? s.saScored : ''}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">
                    {s.saMax > 0 ? s.saMax : ''}
                  </td>

                  {/* FA */}
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">
                    {s.faScored !== null ? s.faScored : ''}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">
                    {s.faMax > 0 ? s.faMax : ''}
                  </td>

                  {/* Total */}
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono font-bold">
                    {s.totalScored !== null ? s.totalScored : ''}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">
                    {s.totalMax}
                  </td>
                  <td className="border border-black px-1 py-0.5 text-center font-bold">
                    {s.grade}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-center font-mono">
                    {s.average}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-t-2 border-black font-bold bg-slate-50">
                <td colSpan={3} className="border border-black px-2 py-1 text-left font-black">
                  Total
                </td>
                <td className="border border-black px-1.5 py-1 text-center font-mono font-black">
                  {card.totalSaScored}
                </td>
                <td className="border border-black px-1.5 py-1 text-center font-mono font-black">
                  {card.totalSaMax}
                </td>
                <td className="border border-black px-1.5 py-1 text-center font-mono font-black">
                  {card.totalFaScored}
                </td>
                <td className="border border-black px-1.5 py-1 text-center font-mono font-black">
                  {card.totalFaMax}
                </td>
                <td className="border border-black px-1.5 py-1 text-center font-mono font-black">
                  {card.grandTotalScored}
                </td>
                <td className="border border-black px-1.5 py-1 text-center font-mono font-black">
                  {card.grandTotalMax}
                </td>
                <td className="border border-black px-1 py-1" />
                <td className="border border-black px-1.5 py-1" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lower Section: ACADEMIC REPORT (Left) & REMARKS AND ACKNOWLEDGMENT (Right) */}
        <div className="grid grid-cols-12 border border-black my-1 text-[10px]">
          {/* Left Column: Academic Report (Col 7) */}
          <div className="col-span-7 border-r border-black">
            <div className="text-center font-bold py-1 border-b border-black uppercase bg-slate-50">
              ACADEMIC REPORT
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-black font-bold">
                  <th className="px-2 py-0.5 text-left border-r border-black" />
                  <th className="px-2 py-0.5 text-center border-r border-black w-20">Scored</th>
                  <th className="px-2 py-0.5 text-center w-20">Out of</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-medium">
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Grand Total:</td>
                  <td className="px-2 py-0.5 text-center border-r border-black font-mono font-bold">{card.grandTotalScored}</td>
                  <td className="px-2 py-0.5 text-center font-mono">{card.grandTotalMax}</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Overall Percentage:</td>
                  <td className="px-2 py-0.5 text-center border-r border-black font-mono font-bold">{card.overallPercentage}</td>
                  <td className="px-2 py-0.5 text-center font-mono">100</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">No. of Subjects Failed:</td>
                  <td className="px-2 py-0.5 text-center border-r border-black font-mono font-bold">{card.noOfSubjectsFailed}</td>
                  <td className="px-2 py-0.5 text-center font-mono">{card.subjects.length}</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Overall Grade:</td>
                  <td colSpan={2} className="px-2 py-0.5 text-center font-bold">{card.overallGrade}</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Overall Rank:</td>
                  <td className="px-2 py-0.5 text-center border-r border-black font-mono font-bold">{card.overallRank}</td>
                  <td className="px-2 py-0.5 text-center font-mono">{card.totalRankStudents || 44}</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Performance level:</td>
                  <td colSpan={2} className="px-2 py-0.5 text-center font-bold">
                    {card.grandTotalScored > 0
                      ? calculatePerformanceLevel(card.grandTotalScored, card.overallPercentage)
                      : (card.performanceLevel && card.performanceLevel !== 'MPL' ? card.performanceLevel : '-')}
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Average Percentage:</td>
                  <td colSpan={2} className="px-2 py-0.5 text-center font-mono font-bold">{card.averagePercentage}</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">GPA:</td>
                  <td colSpan={2} className="px-2 py-0.5 text-center font-mono font-bold">{card.gpa.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-0.5 border-r border-black font-semibold">Class Attendance:</td>
                  <td className="px-2 py-0.5 text-center border-r border-black font-mono font-bold">{card.classAttendancePresent}</td>
                  <td className="px-2 py-0.5 text-center font-mono">{card.classAttendanceTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Column: Remarks and Acknowledgment (Col 5) */}
          <div className="col-span-5 flex flex-col justify-between">
            <div className="text-center font-bold py-1 border-b border-black uppercase bg-slate-50">
              REMARKS AND ACKNOWLEDGMENT
            </div>

            <div className="flex-1 grid grid-rows-2">
              {/* Guardian Box with Vertical Label */}
              <div className="border-b border-black flex">
                <div className="w-8 border-r border-black flex items-center justify-center p-1 bg-slate-50">
                  <span
                    className="font-bold text-[9px] uppercase tracking-wider text-slate-800"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    Guardian
                  </span>
                </div>
                <div className="flex-1 p-2 flex flex-col justify-end text-[9px] text-slate-400">
                  <span>Sign: ____________________</span>
                </div>
              </div>

              {/* Class Teacher Box with Vertical Label */}
              <div className="flex">
                <div className="w-8 border-r border-black flex items-center justify-center p-1 bg-slate-50">
                  <span
                    className="font-bold text-[9px] uppercase tracking-wider text-slate-800"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    Class Teacher
                  </span>
                </div>
                <div className="flex-1 p-2 flex flex-col justify-end text-[9px] text-slate-400">
                  <span>Sign: ____________________</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference & Grading Scale Box */}
        <div className="border border-black p-2 my-1 text-[8.5px] leading-tight space-y-0.5">
          <div className="text-center font-bold uppercase underline">
            Reference
          </div>
          <div className="text-center">
            <strong>M:</strong> Malpractice, <strong>Ab:</strong> Absent. <strong>Grades:</strong> <span className="text-[#a61c1c] font-bold">A+:</span> 90-100%, <strong>A:</strong> 80-89%, <span className="text-[#a61c1c] font-bold">B+:</span> 70-79%, <strong>B:</strong> 61-69%, <span className="text-[#a61c1c] font-bold">C+:</span> 51-59%, <strong>C:</strong> 40-49%, <strong>D:</strong> Below 39%
          </div>
          <div className="text-center">
            <strong>SA Max. Marks:</strong> 70, <strong>FA Max. Marks:</strong> 30/100
          </div>
          <div className="text-center">
            <strong>Outstanding Performance Level (OPL)</strong> = 80% in each subject, <strong>Average Performance (APL)</strong> = 60% in each subject, <strong>Minimum Performance Level (MPL)</strong> = 40% in each subject, <strong>Failed (F)</strong> = less than 40 in any subject.
          </div>
          <div className="text-center text-[7.5px] text-[#a61c1c] font-semibold italic pt-0.5">
            Disclaimer: The Result published online is provisional and can't be used for any official purpose. Care has been given to present it as accurately as possible.
          </div>
        </div>

        {/* Certification & Principal Signature */}
        <div className="border border-black p-2 flex items-center justify-between text-[10px]">
          <div className="font-bold">
            Certification
          </div>

          <div className="text-center space-y-0.5">
            <div className="text-[9px] text-slate-600">(Sign & Seal)</div>
            <div className="font-bold tracking-wider text-xs">Principal</div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Close Bar (Hidden during Print) */}
      {!hideControls && onClose && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white print:hidden">
          <div className="text-xs text-slate-400">
            Finished reviewing or printing? Click below to close the window.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-slate-700 hover:border-rose-500/50"
          >
            <X size={15} className="text-rose-400" />
            <span>Close & Return to Dashboard</span>
          </button>
        </div>
      )}
    </div>
  );
};
