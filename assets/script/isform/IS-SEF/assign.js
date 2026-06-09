import select2 from "select2";
import { host } from "../../utils.js";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getUser } from "@amec/webasset/api/amec";
import { setSelect2 } from "@amec/webasset/select2";
import { showLoader } from "@amec/webasset/preloader";
import { redirectWebflow } from "@amec/webasset/form";
select2();
$(async function () {
    const filters = {
        // PLANYEAR: 2026,
        // STATUS_ID: 6
    }
    const response = await fetchUtils({
        url: process.env.APP_API + "/is-sef/getWorkPlan",
        method: "POST",
        data: filters
    });

    console.log(response);

    const workplan = response.filter(item => item.PLANYEAR >= 2025 && [6, 8].includes(item.STATUS_ID));

    const selectWorkplan = workplan.map(item => ({ value: item.PLANID, text: `${item.REQ_NO} : ${item.TITLE}` }));

    setSelect2({
        element: "#inProjIdSelect",
        data: selectWorkplan,
        size: 'sm'
    })

    async function handleGetUser(val) {
        const userval = await getUser(val);
        if (userval) {
            console.log(userval);
            $("#userName").text(userval.SNAME);
            $("#submit_assign").prop("disabled", false);
        } else {
            $("#userName").text("ไม่พบข้อมูลผู้ใช้");
            $("#submit_assign").prop("disabled", true);
        }
    }

    $("#inUser").on("input", async function () {
        if ($(this).val().length == 5) {
            await handleGetUser($(this).val());
        }
    });

    $("#inProjIdSelect").change(async function () {
        console.log('Selected Project ID:', $(this).val());
        const selectedPlan = workplan.find(plan => plan.PLANID == $(this).val());
        const pic = selectedPlan ? selectedPlan.REQ_PIC : '';
        $("#inUser").val(pic);
        console.log('Selected Plan:', selectedPlan);
        if (pic) {
            await handleGetUser(pic);
        }
    });

    $("#submit_assign").click(async function () {
        const selectedPlanId = Number($("#inProjIdSelect").val());
        const selectedUser = $("#inUser").val();

        const params = new URLSearchParams(window.location.search);
        const empno = params.get("empno");

        console.log('Submitting Assignment:', { selectedPlanId, selectedUser });

        if (!selectedPlanId || !selectedUser) {
            alert("Please select a project and enter a user.");
            return;
        }

        if (selectedUser.length !== 5) {
            alert("กรุณาใส่รหัสพนักงานให้ถูกต้อง");
            return;
        }

        showLoader();
        const assignmentData = {
            REQBY: selectedUser,
            INPUTBY: empno,
            REMARK: "",
            PROJECT_ID: selectedPlanId
        };

        showLoader();
        const response = await fetchUtils({
            url: process.env.APP_API + "/is-sef/insertEmptyForm",
            method: "POST",
            data: assignmentData
        });

        if (response.status) {
            // alert("Assignment successful!");
            redirectWebflow();
        } else {
            alert("Assignment failed: " + (response.message || "Unknown error"));
        }


        // REQBY: string;

        // @IsString()
        // INPUTBY: string;

        // @IsOptional()
        // @IsString()
        // REMARK ?: string;

        // @IsOptional()
        // @IsNumber()
        // PROJECT_ID ?: number;

    });
});