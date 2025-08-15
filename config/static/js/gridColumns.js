import { editableFields } from "./utils.js"

export const allColumns = [
  { headerName: "REF. GIANT", field: "ref_giant", sortable: true, filter: true, minWidth: 140, lockVisible: true },

  { headerName: "Q", field: "q", sortable: true, filter: true, minWidth: 80 },
  { headerName: "C3#", field: "c3", sortable: true, filter: true, minWidth: 80 },
  { headerName: "DELIVERY ID", field: "deliveryid", sortable: true, filter: true, minWidth: 140 },
  {
    headerName: "SO STATUS - RELEASED / ON HOLD / RETURNED",
    field: "sostatus_releasedonholdreturned",
    sortable: true,
    filter: true,
    minWidth: 220,
  },
  { headerName: "RELEASED DT", field: "data_liberacao", sortable: true, filter: true, minWidth: 150 },
  { headerName: "MAWB", field: "mawb", sortable: true, filter: true, minWidth: 120 },
  { headerName: "HAWB", field: "hawb", sortable: true, filter: true, minWidth: 120 },
  { headerName: "CIP BRL", field: "cipbrl", sortable: true, filter: true, minWidth: 120 },
  { headerName: "PC", field: "pc", sortable: true, filter: true, minWidth: 80 },
  { headerName: "GROSS WEIGHT", field: "peso", sortable: true, filter: true, minWidth: 120 },
  { headerName: "CHARGEABLE WEIGHT", field: "peso_cobravel", sortable: true, filter: true, minWidth: 150 },
  { headerName: "TYPE", field: "tipo", sortable: true, filter: true, minWidth: 100 },
  { headerName: "P/UP DT", field: "pupdt", sortable: true, filter: true, minWidth: 120 },
  { headerName: "CI OK", field: "ciok", sortable: true, filter: true, minWidth: 100 },
  { headerName: "LI ENTRY DT", field: "lientrydt", sortable: true, filter: true, minWidth: 140 },
  { headerName: "LI OK", field: "liok", sortable: true, filter: true, minWidth: 100 },
  { headerName: "OK TO SHIP", field: "ok_to_ship", sortable: true, filter: true, minWidth: 140 },
  { headerName: "LI", field: "li", sortable: true, filter: true, minWidth: 80 },
  { headerName: "HAWB DT", field: "hawbdt", sortable: true, filter: true, minWidth: 120 },
  { headerName: "ESTIMATED BOOKING DT", field: "estimatedbookingdt", sortable: true, filter: true, minWidth: 180 },
  { headerName: "ARRIVAL DESTINATION DT", field: "arrivaldestinationdt", sortable: true, filter: true, minWidth: 200 },
  { headerName: "FUNDS REQUEST", field: "solicitacao_fundos", sortable: true, filter: true, minWidth: 180 },
  { headerName: "FUNDS RECEIVED", field: "fundos_recebidos", sortable: true, filter: true, minWidth: 180 },
  { headerName: "EADI DT", field: "eadidt", sortable: true, filter: true, minWidth: 120 },
  { headerName: "DI / DUE DT", field: "diduedt", sortable: true, filter: true, minWidth: 140 },
  { headerName: "DI / DUE NUMBER", field: "diduenumber", sortable: true, filter: true, minWidth: 150 },
  { headerName: "ICMS PAID", field: "icmspago", sortable: true, filter: true, minWidth: 140 },
  { headerName: "CHANNEL COLOR", field: "canal_cor", sortable: true, filter: true, minWidth: 120 },
  { headerName: "CC RLSD DT", field: "data_liberacao_ccr", sortable: true, filter: true, minWidth: 180 },
  { headerName: "NFE DT", field: "data_nfe", sortable: true, filter: true, minWidth: 120 },
  { headerName: "NFE", field: "numero_nfe", sortable: true, filter: true, minWidth: 140 },
  { headerName: "NFTG DT", field: "nftgdt", sortable: true, filter: true, minWidth: 120 },
  { headerName: "NFTG", field: "nftg", sortable: true, filter: true, minWidth: 100 },
  { headerName: "DLV AT DESTINATION", field: "dlvatdestination", sortable: true, filter: true, minWidth: 180 },
  { headerName: "Status IMP/EXP", field: "status_impexp", sortable: true, filter: true, minWidth: 150 },
  { headerName: "EVENT", field: "eventos", sortable: false, filter: true, minWidth: 200 },
  { headerName: "REAL LEAD TIME", field: "real_lead_time", sortable: true, filter: true, minWidth: 160 },
  { headerName: "SHIP FAILURE DAYS", field: "ship_failure_days", sortable: true, filter: true, minWidth: 180 },
  { headerName: "TYPE", field: "tipo_justificativa_atraso", sortable: true, filter: true, minWidth: 220 },
  { headerName: "FAILURE JUSTIFICATION", field: "justificativa_atraso", sortable: true, filter: true, minWidth: 200 },
]

// Separa colunas editáveis e não-editáveis
export const columnDefs = allColumns.map((col) => {
  if (editableFields.includes(col.field)) {
    return {
      ...col,
      editable: true,
      headerClass: "editable-header",
      cellClass: "editable-cell",
    }
  }
  return col
})
