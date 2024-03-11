/** @odoo-module */

import {registry} from "@web/core/registry"
import {formView} from "@web/views/form/form_view"
import {FormController} from "@web/views/form/form_controller"
import {useService} from "@web/core/utils/hooks"
import {url} from "@web/core/utils/urls";

const {status, onWillStart, onMounted, onWillUpdate, onUpdated, onDestroyed, onWillUnmount} = owl
const {Component, useState} = owl

class SignatureFormController extends FormController {
    setup() {
        super.setup()
        this.modelData = useState({
            text: "",
            description: "",
            image: "",
        })


        this.pickingData = useState({
            pickinId: "",
            wizardId: "",
            productList: [],
        })
        this.orm = useService("orm")
        this.canvas = owl.useRef("signatureCanvas");
        this.waiting_div = owl.useRef("waiting_div");
        this.signDiv = owl.useRef("sign_div");

        onMounted(() => {
            this.createSignatureCanvas()
        })

        this.getData().then(r => this.clearSession())

        this.intervalId = setInterval(() => {
                if (status(this) === "destroyed") {
                    clearInterval(this.intervalId)
                } else {
                    this.getPickinId().then(r => this.hideOrShowDiv())
                }
            }
            , 5000)

    }

    hideWaitingDiv() {
        this.waiting_div.el.style.display = "none";
        this.signDiv.el.style.display = "flex";
    }

    showWaitingDiv() {
        this.clearSignature();
        this.waiting_div.el.style.display = "flex";
        this.signDiv.el.style.display = "none";
    }

    async saveSignature() {
        const canvas = this.canvas.el;
        const imageDataURL = canvas.toDataURL();
        try {
            await this.orm.call("stock.picking.external.signature.wizard", "write", [[this.pickingData.wizardId[0].request_wizard_id[0]], {
                signature: imageDataURL.split(',')[1], // Envía solo el contenido de la imagen (sin el prefijo "data:image/png;base64,")
            }]).then(r => this.clearSession())
        } catch (error) {
            console.error("Error saving signature:", error);
        }
    }

    async clearSession() {
        try {
            await this.orm.call("signature.session", "write", [[this.props.resId], {
                signature: false,
                request_wizard_id: false,
                picking_id: false,
            }]);
        } catch (error) {
            console.error("Error saving signature:", error);
        }
    }

    async getData() {
        const res = await this.orm.call("signature.session", "search_read", [], {
            fields: ["text", "description"],
            domain: [["id", "=", this.props.resId]],
        });

        this.modelData.text = res[0].text
        this.modelData.description = res[0].description

        const imageurl = url("/web/image", {
            model: "signature.session",
            field: "image",
            id: this.props.resId,
        });
        this.modelData.image = imageurl

    }

    async getPickinId() {
        this.pickingData.pickinId = await this.orm.call("signature.session", "search_read", [], {
            fields: ["picking_id"],
            domain: [["id", "=", this.props.resId]],
        });
        this.pickingData.wizardId = await this.orm.call("signature.session", "search_read", [], {
            fields: ["request_wizard_id"],
            domain: [["id", "=", this.props.resId]],
        });
        if (this.pickingData.pickinId[0].picking_id && !this.pickingData.productList.length) {
            this.pickingData.productList = await this.orm.call("stock.move", "search_read", [], {
                fields: ["id", "product_id", "quantity_done"],
                domain: [["picking_id", "=", this.pickingData.pickinId[0].picking_id[0]]],
            });
        }

    }

    hideOrShowDiv() {
        if (this.pickingData.pickinId[0].picking_id) {
            this.hideWaitingDiv()
        } else {
            this.showWaitingDiv()
        }
    }

    createSignatureCanvas() {
        const canvas = this.canvas.el;
        const ctx = canvas.getContext("2d");
        const controller = this;
        canvas.width = window.innerWidth * 0.7;
        canvas.height = window.innerHeight;

        let painting = false;

        function startPosition(e) {
            painting = true;
            draw(e);
        }

        function endPosition() {
            painting = false;
            ctx.beginPath();
        }

        function draw(e) {
            if (!painting) return;
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            // Manejo de eventos de pantalla táctil
            if (e.touches) {
                e.preventDefault(); // Evitar el desplazamiento de la página
                const touch = e.touches[0];
                ctx.lineTo(touch.clientX, touch.clientY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(touch.clientX, touch.clientY);
            } else {
                // Manejo de eventos del mouse
                ctx.lineTo(e.clientX, e.clientY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(e.clientX, e.clientY);
            }
        }

        canvas.addEventListener("mousedown", startPosition);
        canvas.addEventListener("mouseup", endPosition);
        canvas.addEventListener("mousemove", draw);

        // Eventos de pantalla táctil
        canvas.addEventListener("touchstart", startPosition);
        canvas.addEventListener("touchend", endPosition);
        canvas.addEventListener("touchmove", draw);
    }


    clearSignature() {
        const canvas = this.canvas.el;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


}

// ResPartnerFormController.template = "owl.ResPartnerFormView"
SignatureFormController.template = "lnxivan_external_signature.SignatureScreen"

export const signatureSessionFormView = {
    ...formView,
    Controller: SignatureFormController,
}

registry.category("views").add("signature_form_view", signatureSessionFormView)