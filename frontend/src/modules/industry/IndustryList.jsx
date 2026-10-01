import { Link } from "react-router-dom";

function IndustryList() {
  return (
    <div>
      <h1>EntreVision</h1>

      <h2>Industries</h2>

      <div>
        <h3>Orange Industry</h3>

        <p>
          Explore entrepreneurial opportunities in the
          Nagpur Orange Industry.
        </p>

        <Link to="/industries/orange">
          <button>View Industry</button>
        </Link>
      </div>
    </div>
  );
}

export default IndustryList;