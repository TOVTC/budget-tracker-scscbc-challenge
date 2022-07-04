let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', {autoIncrement: true});
}

request.onsuccess = function(event) {
    db = event.target.result;  
    if (navigator.onLine) {
        uploadRecord();
    }
}
  
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const recordStore = transaction.objectStore('new_budget');
    recordStore.add(record);
}

function uploadRecord() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const recordStore = transaction.objectStore('new_budget');
    const getAll = recordStore.getAll();
  
    getAll.onsuccess = async function() {
        if (getAll.result.length > 0) {
            try {
                let res = await fetch('/api/transaction', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                    }
                })
                let serverRes = await res.json();
                if (serverRes.message) {
                    throw new Error(serverRes);
                }
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const pizzaObjectStore = transaction.objectStore('new_budget');
                pizzaObjectStore.clear();
                alert('All saved transactions have been submitted!');
            }
            catch (err) {
                console.log(err);
            }
        }
    }
}

window.addEventListener('online', uploadRecord);