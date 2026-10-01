import { Link } from "react-router-dom";

function IndustryDetails() {
  return (
    <div>
      <h1>Orange Industry</h1>

      <p>
        The Orange Industry module contains information about
        orange-based entrepreneurial opportunities in the
        Nagpur region.
      </p>

      <h2>Industry Information</h2>

      <p><strong>Region:</strong> Nagpur, Maharashtra</p>

      <p>
        Orange-related opportunities can include cultivation,
        trading, processing, packaging and distribution.
      </p>

      <Link to="/industries/orange/businesses">
        <button>
          View Business Opportunities
        </button>
      </Link>
    </div>
  );
}

export default IndustryDetails;