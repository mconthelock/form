import "@fancyapps/ui/dist/carousel/carousel.css";
import "@fancyapps/ui/dist/carousel/carousel.autoplay.css";
import { Carousel } from "@fancyapps/ui/dist/carousel/carousel.esm.js";
import { Autoplay } from "@fancyapps/ui/dist/carousel/carousel.autoplay.esm.js";
import { getApplication } from "../docinv/application";

export async function getNews() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/gpreport/news/`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr, status, error) {
        reject({ status, error });
      },
    });
  });
}

//สร้าง Banner ข่าวสาร
export async function createCarousel(type = "home") {
  const obj = $("#news-carousel");
  try {
    const poster = await addPoster();
    obj.append(poster);
    const news = await getNews();
    if (news.length > 0) {
      const url = `https://amecweb.mitsubishielevatorasia.co.th/gpsystem/news/`;
      news.map((el) => {
        const html = type == "home" ? homeCarousel(el) : loginCarousel(el);
        obj.append(html);
      });
    }

    const container = document.getElementById("news-carousel");
    const options = {
      Navigation: false,
      Dots: {
        minCount: 2,
      },
      Autoplay: {
        timeout: 7500,
        showProgress: false,
      },
    };
    new Carousel(container, options, { Autoplay });
  } catch (error) {
    console.log(error);
  }
  return;
}

const homeCarousel = (el) => {
  return `<div class="f-carousel__slide">
          <img class="w-full h-72 object-cover object-center" src="${url}${
    el.NEWS_IMG
  }" alt="title"/>
          <div
              class="absolute top-0 left-0 w-full h-72 p-10 overflow-hidden flex flex-col items-start justify-end lg:w-2/5 lg:min-w-2/5">
              <div class="bg-white/[0.75] p-3 w-full">
                  <h1 class="text-primary text-lg font-bold mb-3 line-clamp-1">${
                    el.NEWS_TITLE
                  }</h1>
                  <div class="line-clamp-2 mb-3">${el.NEWS_DETAIL.replace(
                    /<\/?[^>]+(>|$)/g,
                    ""
                  )}</div>
                  <a class="btn btn-sm btn-primary">Read More</a>
              </div>
          </div>
      </div>`;
};

const loginCarousel = (el) => {
  return `<div class="f-carousel__slide">
        <img class="w-[100vw] h-[100vh] object-cover" src="${url}${el.NEWS_IMG}" alt="${el.NEWS_TITLE}"/>
    </div>`;
};

const addPoster = async () => {
  let img = `${process.env.APP_IMG}/web_flow_2.0.png`;
  const id = $("#appid").val();
  try {
    const app = await getApplication(id);
    img = app.APP_POSTER != null ? app.APP_POSTER : img;
  } catch (error) {
    console.log(error);
  }
  return `<div class="f-carousel__slide">
          <img class="w-[100vw] h-[100vh] object-cover" src="${img}" alt=""/>
      </div>`;
};
