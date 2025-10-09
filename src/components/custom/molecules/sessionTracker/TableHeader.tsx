export const TableHeader = () => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <div className="cell-value" style={{ flex: 0.1, fontSize: 10 }}>
      #
    </div>
    <div className="cell-value" style={{ flex: 0.6, fontSize: 10 }}>
      Status
    </div>

    <div className="cell-value" style={{ flex: 2, fontSize: 10 }}>
      Email
    </div>
    <div className="cell-value" style={{ flex: 1, fontSize: 10 }}>
      Booking on
    </div>
    <div className="cell-value" style={{ flex: 1, fontSize: 10 }}>
      Hopeliner
    </div>
    <div className="table-cell" style={{ flex: 1, fontSize: 10 }}>
      Date Booked
    </div>
  </div>
);
