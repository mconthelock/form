import {
	carousel,
	carouselAuto,
	carouselAutoOption,
	carouselNavOpt,
	fancybox,
} from "@amec/webasset/fancybox";
import {
	toggleActionForm,
	redirectWebflow,
	setformDetail,
} from "@amec/webasset/form";
import { mailForm, mailOpt, sendMail } from "@amec/webasset/sendmail";
import { autosizeTextarea, showMessage } from "@amec/webasset/utils";
import { showLoader } from "@amec/webasset/preloader";
import { doaction, showflow } from "@amec/webasset/api/webform";

var NFRMNO,
	VORGNO,
	CYEAR,
	CYEAR2,
	NRUNNO,
	empno,
	apv,
	mode,
	cextData,
	firstStep; //openModal = true ;//,module,;
$(async function () {
	showLoader();
	NFRMNO = $(".form-info").attr("NFRMNO");
	VORGNO = $(".form-info").attr("VORGNO");
	CYEAR = $(".form-info").attr("CYEAR");
	empno = $(".form-info").attr("empno");
	mode = $(".form-info").attr("mode");
	CYEAR2 = $(".form-info").attr("CYEAR2");
	NRUNNO = $(".form-info").attr("NRUNNO");
	apv = $(".apv-data").attr("apv");
	cextData = $(".apv-data").attr("cextData");
	firstStep = $(".apv-data").attr("firstStep");
	const form = {
		NFRMNO: NFRMNO,
		VORGNO: VORGNO,
		CYEAR: CYEAR,
		CYEAR2: CYEAR2,
		NRUNNO: NRUNNO,
	};

	$(".form-info").html(await setformDetail(form));
	const flow = await showflow({NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO});
    $('#flow').html(flow.html);
	toggleActionForm(mode);

	$("#form").removeClass("hidden");
	$(".load").addClass("hidden");
	showLoader({ show: false });
	const before = carouselAuto("fileBefore", {
		...carouselAutoOption,
		Dots: false,
	});
	const result = carouselAuto("fileResult", {
		...carouselAutoOption,
		Dots: false,
	});
	const navBefore = carousel("navBefore", {
		...carouselNavOpt,
		Sync: { target: before },
	});
	const navResult = carousel("navResult", {
		...carouselNavOpt,
		Sync: { target: result },
	});
	fancybox("fileBefore");
	fancybox("fileResult");
	autosizeTextarea(document.getElementById("workcontent"));
});

$(document).on("click", "button[name='btnAction']", async function () {
	try {
		const action = $(this).val();
		const remark = $("#remark").val();

		const formStatus = await doaction({
			NFRMNO,
			VORGNO,
			CYEAR,
			CYEAR2,
			NRUNNO,
			ACTION: action,
			EMPNO: apv,
			REMARK: remark,
		});

		if (formStatus.status == true) {
			showMessage(`${$(this).text()}!`, "success");
			redirectWebflow();
		} else {
			throw new Error("ไม่สามารถ Approve ได้");
		}
	} catch (e) {
		showMessage(
			`เกิดข้อผิดพลาด: ${e.message} กรุณาลองใหม่อีกครั้งหรือติดต่อ Admin Tel:2038`,
		);
		const mail = { ...mailOpt };
		mail.BODY = [
			` Form Error : do action`,
			mailForm(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO),
			e,
		];
		sendMail(mail);
	}
});
