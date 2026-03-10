import { doaction, showflow } from "@amec/webasset/api/webform";
import { redirectWebflow } from "@amec/webasset/form";

$(document).ready(async function () {

    const formData = $(".form-data").data();
    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

    const flow = await showflow(
        {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
            showStep: true
        }
    );
    $(".flow").html(flow.html);


    const $modal = $("#image-preview-modal");
    const $previewTarget = $("#image-preview-target");
    const $previewLabel = $("#image-preview-label");

    function closePreview() {
        $modal.addClass("hidden").removeClass("flex");
        $("body").removeClass("overflow-hidden");
        $previewTarget.attr("src", "");
        $previewLabel.text("");
    }

    $(document).on("click", ".js-image-preview", function () {
        const imageSrc = $(this).attr("src");
        const previewLabel = $(this).data("preview-label") || "Preview image";

        if (!imageSrc) {
            return;
        }

        $previewTarget.attr("src", imageSrc);
        $previewLabel.text(previewLabel);
        $modal.removeClass("hidden").addClass("flex");
        $("body").addClass("overflow-hidden");
    });

    $(document).on("click", ".js-image-preview-close", function () {
        closePreview();
    });

    $(document).on("keydown", function (event) {
        if (event.key === "Escape" && !$modal.hasClass("hidden")) {
            closePreview();
        }
    });

    $previewTarget.on("click", function (event) {
        event.stopPropagation();
    });

    $(document).on("click", ".btn-approve", async function () {
        const action = $(this).attr("action");
        const aprv = await doaction({
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
            ACTION: action,
            EMPNO: empno,
            REMARK: '' // optional
        });
        if (aprv.status) {
            redirectWebflow();
        }
        console.log(aprv);
    });
});

