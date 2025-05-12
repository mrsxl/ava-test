/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  XLSX: {
    read: (data: any, opts: any) => XLSX.WorkBook;
    utils: {
      sheet_to_json: <T>(worksheet: XLSX.WorkSheet, opts?: XLSX.Sheet2JSONOpts) => T[];
    };
  };
}

declare namespace XLSX {
  interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  interface WorkSheet {
    [cell: string]: any;
  }

  interface Sheet2JSONOpts {
    raw?: boolean;
    range?: any;
    header?: "A" | 1 | string[];
    dateNF?: string;
    defval?: any;
    blankrows?: boolean;
  }
}