const SUPABASE_SECRET =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmVnamF5amVjb3B1bHNlaXl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODM2NjA3OCwiZXhwIjoxOTkzOTQyMDc4fQ.Y7aI6iRAOnaDQ6__C4pEfHwOMopHGMG2lPdMPDh1uYM";
const SUPABASE_URL = "https://wbfegjayjecopulseiyz.supabase.co";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_SECRET);

const getAllTransactions = async () => {
  const load = `
    <tr>
        <td class="text-center" id="loading" colspan="6"></td>
    </tr>`;

  const noData = `
    <tr>
        <td class="text-center" colspan="6">No Transaction Found!</td>
    </tr>`;

  document.getElementById("tbody").innerHTML = load;
  let tbody = document.getElementById("tbody");
  let loading = document.getElementById("loading");
  let tr = "";
  loading.innerText = "Loading....";
  const res = await db.from("transaction").select("*");
  if (res.data.length >= 1) {
    for (var i in res.data) {
      tr += `<tr class="${
        res.data[i].type === "income" ? "table-success" : "table-danger"
      }">
         <th scope="row">${parseInt(i) + 1}</th>
         <td>${res.data[i].title}</td>
         <td>${res.data[i].type.toUpperCase()}</td>
         <td>${res.data[i].created_at.split("T")[0]}</td>
         <td>${formatCurreny(res.data[i].amount)}</td>
         </tr>`;
    }
    tbody.innerHTML = tr;
    loading.innerText = "";
  } else {
    tbody.innerHTML = noData;
  }
};

getAllTransactions();

const filterByMonthAndYear = async (month, year) => {
  const noData = `
    <tr>
        <td class="text-center" colspan="6">No Transaction Found!</td>
    </tr>`;
  let tbody = document.getElementById("tbody");
  let loading = document.getElementById("loading");
  let tr = "";
  loading.innerText = "Loading....";
  const res = await db
    .from("transactions_with_month_year")
    .select("*")
    .eq("month", month)
    .eq("year", year);

  if (res.data.length >= 1) {
    for (var i in res.data) {
      tr += `<tr class="${
        res.data[i].type === "income" ? "table-success" : "table-danger"
      }">
           <th scope="row">${parseInt(i) + 1}</th>
           <td>${res.data[i].title}</td>
           <td>${res.data[i].type.toUpperCase()}</td>
           <td>${res.data[i].created_at.split("T")[0]}</td>
           <td>${formatCurreny(res.data[i].amount)}</td>
           </tr>`;
    }
    tbody.innerHTML = tr;
  } else {
    tbody.innerHTML = noData;
  }
};

const currentYearAndMonth =
  new Date().getFullYear() +
  "-" +
  ("0" + (new Date().getMonth() + 1)).slice(-2);
document.getElementById("filter").value = currentYearAndMonth;

function filterAction() {
  const filterInput = document.getElementById("filter");
  const data = filterInput.value.split("-");

  const loading = `
    <tr>
        <td class="text-center" id="loading" colspan="6"></td>
    </tr>`;

  document.getElementById("tbody").innerHTML = loading;

  filterByMonthAndYear(data[1], data[0]);
}

function formatCurreny(number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    style: "currency",
  }).format(number);
}
