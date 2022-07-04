let db;

// create a new indexedDB database
const request = indexedDB.open('budget_tracker', 1);

// create new version of database if needed
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', {autoIncrement: true});
}

// if request is sucessful and window is connected to network, upload saved records
request.onsuccess = function(event) {
    db = event.target.result;  
    if (navigator.onLine) {
        uploadRecord();
    }
}

// else console.log error
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

// if network not available (catch function executed in index.js), save data to indexedDB
function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const recordStore = transaction.objectStore('new_budget');
    recordStore.add(record);
}

// open transaction with indexedDB database and retrieve saved records
function uploadRecord() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const recordStore = transaction.objectStore('new_budget');
    const getAll = recordStore.getAll();
    // POST request to database using retrieved records
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
                // if successful, remove all records from indexedDB
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

// add event listener to trigger upload if window switches from offline to online
window.addEventListener('online', uploadRecord);