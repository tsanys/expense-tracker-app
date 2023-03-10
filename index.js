const SUPABASE_SECRET =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmVnamF5amVjb3B1bHNlaXl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODM2NjA3OCwiZXhwIjoxOTkzOTQyMDc4fQ.Y7aI6iRAOnaDQ6__C4pEfHwOMopHGMG2lPdMPDh1uYM";
const SUPABASE_URL = "https://wbfegjayjecopulseiyz.supabase.co";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_SECRET);

//Chart
const getData = async () => {
  const { data, error } = await db
    .from("transactions_per_month_type")
    .select("month, type, count, color");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

const createLineChart = async () => {
  const data = await getData();

  const labels = [...new Set(data.map((item) => item.month))];

  const datasets = [
    {
      label: "Income",
      data: data
        .filter((item) => item.type === "income")
        .map((item) => item.count),
      borderColor: "#146C43",
      fill: false,
    },
    {
      label: "Outcome",
      data: data
        .filter((item) => item.type === "outcome")
        .map((item) => item.count),
      borderColor: "#B02A37",
      fill: false,
    },
  ];

  const config = {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  new Chart(document.getElementById("myChart"), config);
};

createLineChart();

//get total amount
const getAllTransactions = async () => {
  const { data, error } = await db.from("transaction").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
};

const getAdjustedTotalAmount = async (transactions) => {
  let totalAmount = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalAmount += transaction.amount;
    } else {
      totalAmount -= transaction.amount;
    }
  });

  return totalAmount;
};

const processTransactions = async () => {
  const transactions = await getAllTransactions();

  const adjustedTotalAmount = await getAdjustedTotalAmount(transactions);

  document.getElementById("total").innerHTML =
    formatCurreny(adjustedTotalAmount);
};

processTransactions();

//Get Data
const getHistory = async () => {
  let group = document.getElementById("history");
  let loading = document.getElementById("loading");
  let list = "";
  loading.innerText = "Loading....";
  const res = await db
    .from("transaction")
    .select("*")
    .order("created_at", { ascending: false })
    .range(0, 2);
  if (res) {
    for (var i in res.data) {
      list += `
            <li class="list-group-item list-group-item-${
              res.data[i].type === "income" ? "success" : "danger"
            }">
                ${res.data[i].title} <br />
                <div class="d-flex justify-content-between flex-row">
                    <span class="fw-bold">
                        ${
                          res.data[i].type === "income"
                            ? "+ " + formatCurreny(res.data[i].amount)
                            : "- " + formatCurreny(res.data[i].amount)
                        }
                    </span>
                    <span class="fw-light">
                        ${res.data[i].created_at.split("T")[0]}
                    </span>
                </div>
            </li>
            `;
    }
    group.innerHTML = list;
    loading.innerText = "";
  } else {
    group.innerHTML = `<li class="list-group-item" id="loading">No Tranasction!</li>`;
  }
};

getHistory();

function formatCurreny(number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    style: "currency",
  }).format(number);
}
