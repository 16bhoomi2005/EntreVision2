function BusinessOpportunities() {
  const opportunities = [
    "Orange Farming",
    "Orange Trading",
    "Orange Grading",
    "Orange Packaging",
    "Orange Juice Processing",
    "Orange Squash Production",
    "Orange Jam / Marmalade",
    "Orange Distribution"
  ];

  return (
    <div>
      <h1>Orange Business Opportunities</h1>

      <p>
        Entrepreneurial opportunities related to the
        Nagpur Orange Industry.
      </p>

      {opportunities.map((business, index) => (
        <div key={index}>
          <h3>{business}</h3>
        </div>
      ))}
    </div>
  );
}

export default BusinessOpportunities;