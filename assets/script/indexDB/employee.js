// import { event } from "jquery";
import { generateSchemaHash } from "./setIndexDB";
const schemEmp = [
  { name: "images", keyPath: "id", indexes: [] },
  { name: "info", keyPath: "id", indexes: [] },
];

async function openEmpDatabase() {
  const currentEmpHash = await generateSchemaHash(schemEmp);
  const storedEmpHash = localStorage.getItem("dbSchemaEmpHash");
  let dbEmpVersion = parseInt(localStorage.getItem("dbEmpVersion")) || 1;
  if (currentEmpHash !== storedEmpHash) {
    dbEmpVersion++;
    localStorage.setItem("dbSchemaEmpHash", currentEmpHash);
    localStorage.setItem("dbEmpVersion", dbEmpVersion);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("employees", dbEmpVersion);
    request.onerror = (event) => {
      console.log(event);
      reject("Failed to open database");
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      schemEmp.forEach((schema) => {
        if (!db.objectStoreNames.contains(schema.name)) {
          const store = db.createObjectStore(schema.name, {
            keyPath: schema.keyPath,
          });
          schema.indexes.forEach((index) => {
            store.createIndex(index.name, index.keyPath, {
              unique: index.unique,
            });
          });
        }
      });
    };
  });
}

// ------------------------- user image -------------------------

export async function setImage(id, base64Image) {
  const db = await openEmpDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");
    const request = store.put({ id: id, image: base64Image });
    // console.log(base64Image);
    request.onsuccess = () => resolve("Image saved successfully");
    request.onerror = () => reject("Failed to save image");
  });
}

export async function getImage(id) {
  const db = await openEmpDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    const request = store.get(id);
    request.onsuccess = (event) => resolve(event.target.result?.image || null);
    request.onerror = () => reject("Failed to fetch image");
  });
}

export async function getAllImage() {
  const db = await openEmpDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result || []);
    request.onerror = () => reject("Failed to fetch images");
  });
}

// ----------------------- Information ----------------------------
export async function setInfo(id, data) {
  const db = await openEmpDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("info", "readwrite");
    const store = transaction.objectStore("info");
    const request = store.put({ id, data });
    // console.log(base64Image);
    request.onsuccess = () => resolve("Information saved successfully");
    request.onerror = () => reject("Failed to save infomation");
  });
}

export async function getInfo(id) {
  const db = await openEmpDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("info", "readonly");
    const store = transaction.objectStore("info");
    const request = store.get(id);
    request.onsuccess = (event) => resolve(event.target.result || null);
    request.onerror = () => reject("Failed to fetch infomation");
  });
}

export async function getAllInfo() {
  const db = await openEmpDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("info", "readonly");
    const store = transaction.objectStore("info");
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result || []);
    request.onerror = () => reject("Failed to fetch informations");
  });
}
