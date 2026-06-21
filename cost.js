const STORAGE_KEY = 'cnst_items';

function loadItems() {
return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveItems(items) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function saveItem() {
const date   = document.getElementById('inputDate').value;
const name   = document.getElementById('inputName').value.trim();
const amount = parseFloat(document.getElementById('inputAmount').value);

if (!date)         { alert('日付を入力してください'); return; }
if (!name)         { alert('名称を入力してください'); return; }
if (isNaN(amount) || amount < 0) { alert('正しい金額を入力してください'); return; }

const items = loadItems();
items.push({ id: Date.now(), date, name, amount });
saveItems(items);

document.getElementById('inputName').value   = '';
document.getElementById('inputAmount').value = '';

renderList();
}

function deleteItem(id) {
const items = loadItems().filter(i => i.id !== id);
saveItems(items);
renderList();
}

function renderList() {
const items = loadItems();
const wrap  = document.getElementById('tableWrap');
const badge = document.getElementById('countBadge');
const totalRow = document.getElementById('totalRow');

badge.textContent = `${items.length} 件`;

if (items.length === 0) {
    wrap.innerHTML = '<p class="empty-msg">まだデータがありません</p>';
    totalRow.style.display = 'none';
    return;
}

const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
const total  = sorted.reduce((s, i) => s + i.amount, 0);

const rows = sorted.map(item => `
    <tr>
    <td class="col-date">${formatDate(item.date)}</td>
    <td class="col-name">${escHtml(item.name)}</td>
    <td class="col-amount">¥${item.amount.toLocaleString()}</td>
    <td class="col-del">
        <button class="btn btn-delete" onclick="deleteItem(${item.id})">削除</button>
    </td>
    </tr>
`).join('');

wrap.innerHTML = `
    <table>
    <thead>
        <tr>
        <th>日付</th>
        <th>名称</th>
        <th style="text-align:right">金額</th>
        <th></th>
        </tr>
    </thead>
    <tbody>${rows}</tbody>
    </table>
`;

document.getElementById('totalAmount').textContent = `¥${total.toLocaleString()}`;
totalRow.style.display = 'flex';
}

function exportCSV() {
const items = loadItems();
if (items.length === 0) { alert('エクスポートするデータがありません'); return; }

const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
const total  = sorted.reduce((s, i) => s + i.amount, 0);

const BOM = '﻿';
const header = '日付,名称,金額\r\n';
const dataRows = sorted.map(i => {
    console.log(i.date)
    return `${i.date},${csvEsc(i.name)},${i.amount}`
}).join('\r\n');
const totalLine = `\r\n合計,,${total}`;


const csv = BOM + header + dataRows + totalLine;
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const url  = URL.createObjectURL(blob);
const a    = document.createElement('a');
a.href     = url;
a.download = `費用管理_${new Date().toISOString().slice(0,10)}.csv`;
a.click();
URL.revokeObjectURL(url);
}

function formatDate(str) {
if (!str) return '';
const [y, m, d] = str.split('-');
return `${y}/${m}/${d}`;
}

function escHtml(str) {
return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function csvEsc(str) {
if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g,'""')}"`;
}
return str;
}

// 初期表示 & 今日の日付をセット
document.addEventListener('DOMContentLoaded', () => {
document.getElementById('inputDate').value = new Date().toISOString().slice(0,10);
renderList();
});

// Enterキーで保存
document.addEventListener('keydown', e => {
if (e.key === 'Enter' && (e.target.id === 'inputName' || e.target.id === 'inputAmount')) {
    saveItem();
}
});

