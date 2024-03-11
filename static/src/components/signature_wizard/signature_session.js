/** @odoo-module */

import {registry} from "@web/core/registry"
import {formView} from "@web/views/form/form_view"
import {FormController} from "@web/views/form/form_controller"
import {useService} from "@web/core/utils/hooks"
import {url} from "@web/core/utils/urls";

const {status, onWillStart, onMounted, onWillUpdate, onUpdated, onDestroyed, onWillUnmount, useRef} = owl
const {Component, useState} = owl

class SignatureWizardFormController extends FormController {
    setup() {
        super.setup()
        console.log(this)
        this.wizData = useState({
            signature: "",
            status: ""
        })
        console.log("Por la democracion")
        this.orm = useService("orm")

        this.intervalId = setInterval(() => {
                if (status(this) === "destroyed") {
                    clearInterval(this.intervalId)
                } else {
                    this.checkSignature()
                }
            }
            , 5000)

    }

    async checkSignature() {
        console.log("Checking signature")
        const signatureData = await this.orm.call("stock.picking.external.signature.wizard", "search_read", [], {
            fields: ["signature"],
            domain: [["id", "=", this.props.resId]],
        });

        console.log(signatureData)
        if (signatureData.length > 0) {
            const imageurl = url("/web/image", {
                model: "stock.picking.external.signature.wizard",
                field: "signature",
                id: this.props.resId,
            });
            this.wizData.signature = imageurl
        }
    }

}

SignatureWizardFormController.template = "lnxivan_external_signature.SignatureWizard"

export const signatureWizardFormView = {
    ...formView,
    Controller: SignatureWizardFormController,
}

registry.category("views").add("signature_wizard_form_view", signatureWizardFormView)