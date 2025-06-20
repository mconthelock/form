import { generateSchemaHash } from "./setIndexDB";


const apps = "apps";
const schemaApp = [
  {
    name: apps,
    keyPath: "id",
    indexes: [{ name: "appid", keyPath: "id", unique: true }],
  },
  { name: "links", keyPath: "id", indexes: [] },
];

async function openAppDatabase() {
  const currentHash = await generateSchemaHash(schemaApp);
  const storedHash = localStorage.getItem("dbSchemaAppHash");
  let dbVersion = parseInt(localStorage.getItem("dbAppVersion")) || 1;
  if (currentHash !== storedHash) {
    dbVersion++;
    localStorage.setItem("dbSchemaAppHash", currentHash);
    localStorage.setItem("dbAppVersion", dbVersion);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("applications", dbVersion);
    request.onerror = (event) => reject("Failed to open database");
    request.onsuccess = (event) => resolve(event.target.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      schemaApp.forEach((schema) => {
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

// Links
export async function getLinks(id = undefined) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("links", "readonly");
    const store = transaction.objectStore("links");
    var request;
    if (id === undefined) request = store.getAll();
    else request = store.get(Number(id));
    request.onsuccess = (event) => resolve(event.target.result || null);
    request.onerror = () => reject("Failed to fetch link");
  });
}

export async function setLinks(id, data) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("links", "readwrite");
    const store = transaction.objectStore("links");
    const request = store.put({ id: id, data: data });
    request.onsuccess = () => resolve("Links created successfully");
    request.onerror = () => reject("Failed to create links");
  });
}

// Authen
export async function getAuthen(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("authen", "readonly");
    const store = transaction.objectStore("authen");
    const request = store.get(id);
    request.onsuccess = (event) => resolve(event.target.result || null);
    request.onerror = () => reject("Failed to fetch users");
  });
}

export async function setAuthen(id, data) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("authen", "readwrite");
    const store = transaction.objectStore("authen");
    const request = store.put({ id: id, data: data });
    request.onsuccess = () => resolve("Links created successfully");
    request.onerror = () => reject("Failed to create user");
  });
}
// Amecweb
export async function getAmecweb(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("amecweb", "readonly");
    const store = transaction.objectStore("amecweb");
    const request = store.get(id);
    request.onsuccess = (event) => resolve(event.target.result || null);
    request.onerror = () => reject("Failed to fetch users");
  });
}

export async function setAmecweb(id, data) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("amecweb", "readwrite");
    const store = transaction.objectStore("amecweb");
    const request = store.put({ id: id, data: data });
    request.onsuccess = () => resolve("Links created successfully");
    request.onerror = () => reject("Failed to create user");
  });
}

// Application
export async function setApp(id, data) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(apps, "readwrite");
    const store = transaction.objectStore(apps);
    const app = { id: id, data: data };
    const request = store.put(app);
    request.onsuccess = () => resolve("App created successfully");
    request.onerror = () => reject("Failed to create app");
  });
}

export async function getApp(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(apps, "readonly");
    const store = transaction.objectStore(apps);
    const request = store.get(id);
    request.onsuccess = (e) => resolve(e.target.result || null);
    request.onerror = () => reject("Failed to fetch app");
  });
}

export async function getAllApps() {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(apps, "readonly");
    const store = transaction.objectStore(apps);
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result || []);
    request.onerror = () => reject("Failed to fetch apps");
  });
}

export async function deleteApp(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(apps, "readwrite");
    const store = transaction.objectStore(apps);
    const request = store.delete(id);
    request.onsuccess = () => resolve("App deleted successfully");
    request.onerror = () => reject("Failed to delete app");
  });
}

export async function clearApp() {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(apps, "readwrite");
    const store = transaction.objectStore(apps);
    const request = store.clear();
    request.onsuccess = () => resolve("App cleared successfully");
    request.onerror = () => reject("Failed to clear app");
  });
}
