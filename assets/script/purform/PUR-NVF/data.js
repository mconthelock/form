import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function create(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-nvf`,
        method: 'POST',
        data: formData,
    });
}

export async function approveReturn(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-nvf`,
        method: 'PATCH',
        data: formData,
    });
}

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-form/data`,
        method: 'POST',
        data: form,
    });
}

export async function getTermcode() {
    return fetchUtils({
        url: `${process.env.APP_API}/pursys/termcode`,
        method: 'GET',
    });
}

export async function getCountries() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/countries`,
        method: 'GET',
    });
    // const data = await fetchUtils({
    //     url: `https://restcountries.com/v3.1/all?fields=name,cca2,translations`,
    //     method: "GET",
    // });
    //     // ตัวแปลงรหัสประเทศเป็นภาษาไทยของ Browser
    //     const regionNamesInThai = new Intl.DisplayNames(['th'], { type: 'region' });

    //     return data.map(country => {
    //         let nameThai = 'N/A';
    //         try {
    //             // พยายามแปลงเป็นภาษาไทย ถ้าไม่มีให้ใช้ของ API หรือภาษาอังกฤษ
    //             nameThai = regionNamesInThai.of(country.cca2) || country.translations?.tha?.common || country.name?.common;
    //         } catch (e) {
    //             nameThai = country.translations?.tha?.common || country.name?.common || 'N/A';
    //         }

    //         return {
    //             id: country.cca2,
    //             nameen: country.name?.common || 'N/A',
    //             nameth: nameThai
    //         };
    //     });
}

export async function getProvinces() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/provinces`,
        method: 'GET',
    });
}

export async function getDistricts() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/districts`,
        method: 'GET',
    });

    // const data = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json");
    // const districts = await data.json();
    //  districts.sort((a, b) => a.name_en.localeCompare(b.name_en));
    // return districts.map(district => ({
    //     id: district.id,
    //     nameen: district.name_en,
    //     nameth: district.name_th,
    //     province_id: district.province_id
    // }));
}

export async function getSubDistricts() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/sub-districts`,
        method: 'GET',
    });

    //     const data = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json");
    //     const subDistricts = await data.json();
    //    subDistricts.sort((a, b) => a.name_en.localeCompare(b.name_en));
    //     return subDistricts.map(subDistrict => ({
    //         id: subDistrict.id,
    //         nameen: subDistrict.name_en,
    //         nameth: subDistrict.name_th,
    //         district_id: subDistrict.district_id,
    //         postcode: subDistrict.zip_code
    //     }));
}

export async function getVendor(searchParams) {
    const query = new URLSearchParams();

    if (searchParams) {
        // วนลูปคีย์ทั้งหมดใน searchParams ถ้ามีค่า (ไม่เป็น undefined หรือค่าว่าง) ให้ใส่ใน query
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';

    return fetchUtils({
        url: `${process.env.APP_API}/pursys/pur_vendors/search${queryString}`,
        method: 'GET',
    });
}
