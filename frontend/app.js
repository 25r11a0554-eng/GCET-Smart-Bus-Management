const API = localStorage.getItem('smartbus_api') || 'http://localhost:8080/api';

const data = { buses: [], routes: [], students: [], drivers: [], schedules: [] };

const fields = {
  bus: [['busNumber','Bus number'],['registrationNumber','Registration number'],['capacity','Capacity']],
  route: [['routeName','Route name'],['pickupPoints','Pickup points (comma separated)'],['busNumber','Bus number'],['distanceKm','Distance (km)']],
  student: [['studentName','Student name'],['rollNumber','Roll number'],['phone','Phone'],['routeName','Route name']],
  driver: [['driverName','Driver name'],['phone','Phone'],['licenseNumber','License number'],['busNumber','Bus number']],
  schedule: [['busNumber','Bus number'],['departureTime','Departure time'],['arrivalTime','Arrival time'],['day','Days']]
};
const plural = {bus:'buses',route:'routes',student:'students',driver:'drivers',schedule:'schedules'};
const titles = {bus:'Buses',route:'Routes',student:'Students',driver:'Drivers',schedule:'Schedules'};

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(API + endpoint, {
    ...options,
    headers: {'Content-Type':'application/json', ...(options.headers || {})}
  });
  if (!response.ok) throw new Error((await response.text()) || `Server error: ${response.status}`);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function normalizeRecords(result) {
  if (!result) return [];
  if (!Array.isArray(result)) result = result.records || result.data || result.content || [];
  if (!Array.isArray(result)) return [];
  return result.map(item => {
    if (item && typeof item === 'object') {
      const value = item.data ?? item.payload ?? item.record;
      if (typeof value === 'string') {
        try { return {...JSON.parse(value), id:item.id}; } catch (_) {}
      }
      if (value && typeof value === 'object') return {...value, id:item.id ?? value.id};
    }
    return item;
  });
}

async function loadData() {
  try {
    const keys = Object.keys(data);
    const results = await Promise.all(keys.map(key => apiRequest('/' + key)));
    keys.forEach((key, index) => data[key] = normalizeRecords(results[index]));
    render();
    console.log('Records loaded from Java backend.');
  } catch (error) {
    console.error(error);
    alert('Cannot connect to the Java backend. Make sure Spring Boot is running on port 8080.');
  }
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(element => element.classList.add('hidden'));
  const selected = document.getElementById(page);
  if (selected) selected.classList.remove('hidden');
  document.querySelectorAll('.nav').forEach(element => element.classList.toggle('active', element.dataset.page === page));
  document.getElementById('pageTitle').textContent = page[0].toUpperCase() + page.slice(1);
}
document.querySelectorAll('.nav').forEach(button => button.onclick = () => showPage(button.dataset.page));

function table(key) {
  const rows = data[key] || [];
  if (!rows.length) return '<div class="empty">No records yet. Add your first record.</div>';
  const columns = Object.keys(rows[0]).filter(column => column !== 'id');
  return `<table><thead><tr>${columns.map(column => `<th>${escapeHTML(column.replace(/[A-Z]/g, letter => ' ' + letter)).toUpperCase()}</th>`).join('')}<th>Action</th></tr></thead><tbody>
  ${rows.map(record => `<tr>${columns.map(column => `<td>${escapeHTML(record[column])}</td>`).join('')}<td><button class="outline" onclick="removeItem('${key}','${escapeHTML(record.id)}')">Delete</button></td></tr>`).join('')}
  </tbody></table>`;
}

async function removeItem(key, id) {
  if (!confirm('Delete this record?')) return;
  try {
    await apiRequest('/' + key + '/' + encodeURIComponent(id), {method:'DELETE'});
    await loadData();
    alert('Record deleted successfully.');
  } catch (error) {
    alert('Unable to delete record: ' + error.message);
  }
}

function render() {
  ['bus','route','student','driver','schedule'].forEach(key => {
    const element = document.getElementById(key + 'Table');
    if (element) element.innerHTML = table(plural[key]);
  });
  document.getElementById('busCount').textContent = data.buses.length;
  document.getElementById('routeCount').textContent = data.routes.length;
  document.getElementById('studentCount').textContent = data.students.length;
  document.getElementById('driverCount').textContent = data.drivers.length;
  const recent = document.getElementById('recentBuses');
  if (recent) recent.innerHTML = table('buses');
}

function openModal(key) {
  document.getElementById('modalTitle').textContent = 'Add ' + titles[key].slice(0,-1);
  const form = document.getElementById('itemForm');
  form.innerHTML = fields[key].map(([name,label]) => `<input name="${name}" placeholder="${label}" required>`).join('') + '<button type="submit">Save record</button>';
  form.onsubmit = async event => {
    event.preventDefault();
    const record = Object.fromEntries(new FormData(form));
    if (key === 'bus') record.capacity = Number(record.capacity);
    if (key === 'route') record.distanceKm = Number(record.distanceKm);
    try {
      await apiRequest('/' + plural[key], {method:'POST', body:JSON.stringify(record)});
      closeModal();
      await loadData();
      alert('Record saved successfully!');
    } catch (error) {
      alert('Unable to save record: ' + error.message);
    }
  };
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('modal').classList.add('hidden'); }

document.getElementById('findBus').onclick = () => {
  const query = document.getElementById('pickup').value.trim().toLowerCase();
  const result = document.getElementById('routeResult');
  if (!query) { result.textContent = 'Please enter a pickup location.'; return; }
  const found = data.routes.filter(route =>
    String(route.pickupPoints || '').toLowerCase().includes(query) ||
    String(route.routeName || '').toLowerCase().includes(query)
  );
  result.innerHTML = found.length ? found.map(route =>
    `<b>${escapeHTML(route.busNumber)}</b> — ${escapeHTML(route.routeName)}<br><small>${escapeHTML(route.pickupPoints)}</small><hr>`
  ).join('') : 'No matching route found. Contact the transport office.';
};

loadData();
