/** @odoo-module */

import {registry} from "@web/core/registry"
import {formView} from "@web/views/form/form_view"
import {FormController} from "@web/views/form/form_controller"
import {useService} from "@web/core/utils/hooks"
import {url} from "@web/core/utils/urls";

const {onWillStart, onMounted, onWillUpdate, onUpdated, onDestroyed} = owl
const {Component, useState} = owl

class SignatureWizardFormController extends FormController {
    setup() {
        super.setup()
        this.requestSignature = useState(false)
        this.waiting = useState(false)
        // this.pickingData = useState({
        //     pickinId: "",
        //     productList: [],
        // })
        console.log("Por la democracion")
        this.orm = useService("orm")

        // onMounted(() => {
        //     this.createSignatureCanvas()
        // })

        // this.getData().then(r => console.log(r))
        //
        // setInterval(() => {
        //         this.getPickinId().then(r => this.hideOrShowDiv())
        //     }
        //     , 5000)

    }


    async getPickinId() {
        this.pickingData.pickinId = await this.orm.call("signature.session", "search_read", [], {
            fields: ["picking_id"],
            domain: [["id", "=", this.props.resId]],
        });
        if (this.pickingData.pickinId[0].picking_id && !this.pickingData.productList.length) {
            this.pickingData.productList = await this.orm.call("stock.move", "search_read", [], {
                fields: ["id", "product_id", "quantity_done"],
                domain: [["picking_id", "=", this.pickingData.pickinId[0].picking_id[0]]],
            });
            }

    }

}

// ResPartnerFormController.template = "owl.ResPartnerFormView"
SignatureWizardFormController.template = "lnxivan_external_signature.SignatureWizard"

export const signatureWizardFormView = {
    ...formView,
    Controller: SignatureWizardFormController,
}

registry.category("views").add("signature_wizard_form_view", signatureWizardFormView)