import { generateSchemaHash } from "./setIndexDB";
import { getInfo } from "./employee";
const schemaApp = [
  { name: "group", keyPath: "id", indexes: [] },
  { name: "menu", keyPath: "id", indexes: [] },
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
    const request = indexedDB.open("userAuth", dbVersion);
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

// Group
export async function setGroup(id, data) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("group", "readwrite");
    const store = transaction.objectStore("group");
    const group = { id: id, data: data };
    const request = store.put(group);
    request.onsuccess = () => resolve("Group created successfully");
    request.onerror = () => reject("Failed to create group");
  });
}

export async function getGroup(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("group", "readonly");
    const store = transaction.objectStore("group");
    const request = store.get(id);
    request.onsuccess = (e) => resolve(e.target.result || null);
    request.onerror = () => reject("Failed to fetch group");
  });
}

export async function getAllGroups() {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("group", "readonly");
    const store = transaction.objectStore("group");
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result || []);
    request.onerror = () => reject("Failed to fetch groups");
  });
}

export async function deleteGroup(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("group", "readwrite");
    const store = transaction.objectStore("group");
    const request = store.delete(id);
    request.onsuccess = () => resolve("Group deleted successfully");
    request.onerror = () => reject("Failed to delete group");
  });
}

export async function clearGroup() {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("group", "readwrite");
    const store = transaction.objectStore("group");
    const request = store.clear();
    request.onsuccess = () => resolve("Group cleared successfully");
    request.onerror = () => reject("Failed to clear group");
  });
}

// ----------------------------------------------------


// Menu
export async function setMenu(id, data) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("menu", "readwrite");
    const store = transaction.objectStore("menu");
    const menu = { id: id, data: data };
    const request = store.put(menu);
    request.onsuccess = () => resolve("Menu created successfully");
    request.onerror = () => reject("Failed to create menu");
  });
}
export async function getMenu(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("menu", "readonly");
    const store = transaction.objectStore("menu");
    const request = store.get(id);
    request.onsuccess = (e) => resolve(e.target.result || null);
    request.onerror = () => reject("Failed to fetch menu");
  });
}
export async function getAllMenus() {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("menu", "readonly");
    const store = transaction.objectStore("menu");
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result || []);
    request.onerror = () => reject("Failed to fetch menus");
  });
}
export async function deleteMenu(id) {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("menu", "readwrite");
    const store = transaction.objectStore("menu");
    const request = store.delete(id);
    request.onsuccess = () => resolve("Menu deleted successfully");
    request.onerror = () => reject("Failed to delete menu");
  });
}
export async function clearMenu() {
  const db = await openAppDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("menu", "readwrite");
    const store = transaction.objectStore("menu");
    const request = store.clear();
    request.onsuccess = () => resolve("Menu cleared successfully");
    request.onerror = () => reject("Failed to clear menu");
  });
}

// ----------------------------------------------------
// Get all application data

export async function getAllAppData() {
  const groups = await getAllGroups();
  const infos = await getAllInfos();
  const menus = await getAllMenus();

  return {
    groups,
    infos,
    menus
  };
}

export async function clearAllAppData() {
  await clearGroup();
  await clearInfo();
  await clearMenu();

  return "All application data cleared successfully";
}

export async function getAppDataById(id) {
  const [program, empno] = id.split("-");
  const group = await getGroup(id);
  const info = await getInfo(empno);
  const menu = await getMenu(id);

  return {
    group,
    info,
    menu
  };
}






