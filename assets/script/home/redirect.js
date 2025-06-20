// import { sendSession, setCkkey } from "../utils";
// import { getIP, getUserGroup } from "../webservice";
// import { getAuthen, setAuthen } from "../indexDB/application";
// import { showMessage } from "../jFuntion";
// import { getAuth } from "../login";
// import Cookies from "js-cookie";
// import { setUserAuth } from "../indexDB/setIndexDB";
// import { getGroup } from "../indexDB/userAuth";
// import { encryptText } from "../inc/_crypto";

// $(document).ready(async function () {
//     const id = `${$("#appid").val()}-${$("#empno").val()}`;
//     const aunth = await getAuthen(id);
//     console.log(1, aunth);

//     const url = Cookies.get(id);
//     if(url){
//         console.log(2, url);
//         window.location.href = `${process.env.APP_HOST}${atob(url)}`;
//     }

//     //Used to logged in to target app
//     if (aunth != null) {
//         const apps = aunth.data.apps;
//         let group = aunth.data.group;
//         if (apps.APP_LOGIN == 1 && group.length == 0) {
//             window.location.href = `${process.env.APP_ENV}/authen/accessdinied`;
//         } else {
//             group = group[0];
//             console.log(group);
//         }
//         // console.log(apps, group);

//         // const chkDate = await getUserGroup(group.USERS_GROUP, apps.APP_ID);

//         // if (new Date(chkDate[0].VUPDATE_DATE) <= new Date(group.VUPDATE_DATE)) {
//         //   console.log("Old");
//         //   const dir = await sendSession(
//         //     `${process.env.APP_HOST}/${apps.APP_LOCATION}`,
//         //     aunth.data
//         //   );
//         //   window.location.href = `/${apps.APP_LOCATION}/${dir.url}`;
//         //   return;
//         // }
//     }

//     //Try to bg login
//     const auth = await getAuth($("#appid").val());
//     const client = await getIP(); //Reduce -- 1
//     const usr = {
//         username: $("#users").val(),
//         program: $("#appid").val(),
//         auth: auth,
//         // auth: $("#auth").val(),
//         client: client.IP,
//     };
//     const user = await bglogin(usr);
//     if (user.status === true) {
//         const apps = user.message.apps;
//         const location = apps.APP_LOCATION;


//         await setUserAuth(id, user.message); // เก็บข้อมูล Session ลง IndexDB ให้เว็บปลายทางใช้
//         const authKey = setCkkey($("#appid").val(),$("#empno").val());
//         localStorage.setItem(location, authKey); // เก็บ key cookie ไว้ใน localStorage
//         Cookies.set(authKey, encryptText(id, location), { expires: 0.5 / 24 }); // Set cookie for 30 minutes

//         if(apps.APP_ID != '28'){
//             const dir = await sendSession(
//                 `${process.env.APP_HOST}/${location}`,
//                 user.message
//             );
//             window.location.href = `${process.env.APP_HOST}/${location}/${dir.url}`;
//         }else{
//             const dir = user.message.group.length > 0 ? (user.message.group[0].GROUP_HOME ? user.message.group[0].GROUP_HOME : '') : '';
//             window.location.href = `${process.env.APP_HOST}/${location}/${dir}`;
//         }
//         await setAuthen(id, user.message);
//     }else {
//         //ถ้าไม่มีสิทธิ์ให้ Redirect ไปยังหน้า Access Denied
//         if(user.message.includes("no permission")){
//             window.location.href = `${process.env.APP_ENV}/authen/accessdinied`;
//             return;
//         }
//     }
// });

// function bglogin(data) {
//     return new Promise((resolve) => {
//         $.ajax({
//             type: "post",
//             url: `${process.env.APP_API}/api/authentication/directlogin/`,
//             dataType: "json",
//             data: data,
//             success: function (response) {
//                 resolve(response);
//             },
//         });
//     });
// }
