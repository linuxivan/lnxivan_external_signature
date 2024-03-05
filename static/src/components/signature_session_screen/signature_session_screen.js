/** @odoo-module */

import {registry} from "@web/core/registry"
import {formView} from "@web/views/form/form_view"
import {FormController} from "@web/views/form/form_controller"
import {useService} from "@web/core/utils/hooks"
import { url } from "@web/core/utils/urls";

const {onWillStart, onMounted, onWillUpdate, onUpdated, onDestroyed} = owl
const {Component, useState} = owl

class SignatureFormController extends FormController {
    setup() {
        super.setup()

        this.modelData = useState({
            text: "",
            description: "",
            image: "",
        })
        console.log(this)
        this.orm = useService("orm")
        this.canvas = owl.useRef("signatureCanvas");

        onMounted(() => {
            this.createSignatureCanvas()
        })

        this.getData().then(r => console.log(r))

    }

    async getData() {
        console.log("Getting data")
        console.log(this.props.resId)
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
        console.log(imageurl)
        this.modelData.image = imageurl

    }

    createSignatureCanvas() {
        console.log("Creating signature canvas");
        const canvas = this.canvas.el;
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
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

    saveSignature() {
        console.log("hola")
    }

}

// ResPartnerFormController.template = "owl.ResPartnerFormView"
SignatureFormController.template = "lnxivan_external_signature.SignatureScreen"

export const signatureSessionFormView = {
    ...formView,
    Controller: SignatureFormController,
}

registry.category("views").add("signature_form_view", signatureSessionFormView)