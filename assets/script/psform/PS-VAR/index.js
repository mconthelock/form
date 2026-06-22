import { fetchUtils } from "@amec/webasset/api/fetch-utils";

const numberformat = (value) => {
    const amount = Number(value);
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(Number.isFinite(amount) ? amount : 0);
};

$(async function () {
    const result = await fetchUtils({
        url: process.env.APP_API + "/ps-var/getDataResult",
        method: "POST",
        data: {
            reportID: 1
        }
    });

    console.log(result);
    const diff = result.filter(row => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return actualqty !== row.ON_HAND;
    });

    const total = result.length;
    const totalSum = result.reduce((sum, row) => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return sum + actualqty;
    }, 0);

    const totalSumAmount = result.reduce((sum, row) => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return sum + actualqty * Number(row.PRICE);
    }, 0);

    const checking = result.filter(row => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY);
        return actualqty;
    });

    const checkingSumAmount = checking.reduce((sum, row) => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY);
        return sum + actualqty * Number(row.PRICE);
    }, 0);

    const diffFirst = result.filter(row => {
        const actualqty = Number(row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return actualqty !== row.ON_HAND;
    });

    const diffFirstSumAmount = diffFirst.reduce((sum, row) => {
        const actualqty = Number(row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return sum + Math.abs(actualqty - row.ON_HAND) * Number(row.PRICE);
    }, 0);

    const diffAfter = result.filter(row => {
        const actualqty = Number(row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return actualqty !== row.ON_HAND;
    });

    const diffAfterSumAmount = diffAfter.reduce((sum, row) => {
        const actualqty = Number(row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        console.log(actualqty, row.ON_HAND, row.PRICE);
        return sum + Math.abs(actualqty - row.ON_HAND) * Number(row.PRICE);
    }, 0);

    const variance = diff.length;
    const varianceSum = diff.reduce((sum, row) => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        return sum + Math.abs(actualqty - row.ON_HAND);
    }, 0);

    const varianceSumAmount = diff.reduce((sum, row) => {
        const actualqty = Number(row.FINAL_QTY ?? row.RECHECK_QTY ?? row.RANDOM_CHECK ?? row.ACTUAL_QTY ?? row.ON_HAND);
        // console.log(actualqty, row.ON_HAND, row.PRICE);
        return sum + Math.abs(actualqty - row.ON_HAND) * Number(row.PRICE);
    }, 0);

    const resultGroupby = result.reduce((group, row) => {
        const key = row.GROUP_CODE;
        if (!group[key]) {
            group[key] = [];
        }
        group[key].push(row);
        return group;
    }, {});


    const A1 = resultGroupby["A1"] || [];
    const A2 = resultGroupby["A2"] || [];
    const A3 = resultGroupby["A3"] || [];
    const BE = (resultGroupby["B"] || []).concat(resultGroupby['E'] || []);
    const CDFGI = (resultGroupby["C"] || []).concat(resultGroupby['D'] || []).concat(resultGroupby['F'] || []).concat(resultGroupby['G'] || []).concat(resultGroupby['I'] || []);

    console.log("A3", A3);

    $(".date-A1").text(A1.length > 0 ? A1[0].ASSIGN_DETAIL.CHECK_PERIOD : ".....\\...");
    $(".date-A2").text(A2.length > 0 ? A2[0].ASSIGN_DETAIL.CHECK_PERIOD : ".....\\...");
    $(".date-A3").text(A3.length > 0 ? A3[0].ASSIGN_DETAIL.CHECK_PERIOD : ".....\\...");
    $(".date-BE").text(BE.length > 0 ? BE[0].ASSIGN_DETAIL.CHECK_PERIOD : ".....\\...");
    $(".date-CDFGI").text(CDFGI.length > 0 ? CDFGI[0].ASSIGN_DETAIL.CHECK_PERIOD : ".....\\...");

    $(".total-A1").text(numberformat(A1.length));
    $(".total-A2").text(numberformat(A2.length));
    $(".total-A3").text(numberformat(A3.length));
    $(".total-BE").text(numberformat(BE.length));
    $(".total-CDFGI").text(numberformat(CDFGI.length));
    $(".grand-total").text(numberformat(A1.length + A2.length + A3.length + BE.length + CDFGI.length));
    // Object.values(resultGroupby).forEach(element => {
    //     console.log("group", element);
    // });

    $(".onhand-A1").text(numberformat(A1.reduce((sum, row) => sum + Number(row.ON_HAND), 0)));
    $(".onhand-A2").text(numberformat(A2.reduce((sum, row) => sum + Number(row.ON_HAND), 0)));
    $(".onhand-A3").text(numberformat(A3.reduce((sum, row) => sum + Number(row.ON_HAND), 0)));
    $(".onhand-BE").text(numberformat(BE.reduce((sum, row) => sum + Number(row.ON_HAND), 0)));
    $(".onhand-CDFGI").text(numberformat(CDFGI.reduce((sum, row) => sum + Number(row.ON_HAND), 0)));
    $(".grand-onhand").text(numberformat(A1.reduce((sum, row) => sum + Number(row.ON_HAND), 0) +
        A2.reduce((sum, row) => sum + Number(row.ON_HAND), 0) +
        A3.reduce((sum, row) => sum + Number(row.ON_HAND), 0) +
        BE.reduce((sum, row) => sum + Number(row.ON_HAND), 0) +
        CDFGI.reduce((sum, row) => sum + Number(row.ON_HAND), 0)));

    $(".price-unit-A1").text(numberformat(A1.reduce((sum, row) => sum + Number(row.PRICE), 0)));
    $(".price-unit-A2").text(numberformat(A2.reduce((sum, row) => sum + Number(row.PRICE), 0)));
    $(".price-unit-A3").text(numberformat(A3.reduce((sum, row) => sum + Number(row.PRICE), 0)));
    $(".price-unit-BE").text(numberformat(BE.reduce((sum, row) => sum + Number(row.PRICE), 0)));
    $(".price-unit-CDFGI").text(numberformat(CDFGI.reduce((sum, row) => sum + Number(row.PRICE), 0)));
    $(".grand-price-unit").text(numberformat(A1.reduce((sum, row) => sum + Number(row.PRICE), 0) +
        A2.reduce((sum, row) => sum + Number(row.PRICE), 0) +
        A3.reduce((sum, row) => sum + Number(row.PRICE), 0) +
        BE.reduce((sum, row) => sum + Number(row.PRICE), 0) +
        CDFGI.reduce((sum, row) => sum + Number(row.PRICE), 0)));

    $(".amount-A1").text(numberformat(A1.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0)));
    $(".amount-A2").text(numberformat(A2.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0)));
    $(".amount-A3").text(numberformat(A3.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0)));
    $(".amount-BE").text(numberformat(BE.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0)));
    $(".amount-CDFGI").text(numberformat(CDFGI.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0)));
    $(".grand-amount").text(numberformat(A1.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0) +
        A2.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0) +
        A3.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0) +
        BE.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0) +
        CDFGI.reduce((sum, row) => sum + Number(row.ON_HAND) * Number(row.PRICE), 0)));

    $(".total").text(total);
    $(".totalSum").text(numberformat(totalSum));
    $(".total-amount").text(numberformat(totalSumAmount));
    $(".checking").text(checking.length);
    $(".checking-amount").text(numberformat(checkingSumAmount));
    $(".diff-first").text(diffFirst.length);
    $(".diff-first-amount").text(numberformat(diffFirstSumAmount));
    $(".diff-after").text(diffAfter.length);
    $(".diff-after-amount").text(numberformat(diffAfterSumAmount));
    $(".variance").text(variance);
    $(".varianceSum").text(varianceSum);
    $(".variance-amount").text(numberformat(varianceSumAmount));
});