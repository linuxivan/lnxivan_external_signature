# Copyright Ivan Perez Louzan <http://www.lnxivan.com>
from odoo import models, fields, api


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    def action_open_signature_wizard(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'External Signature',
            'res_model': 'stock.picking.external.signature.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_picking_id': self.id,
            }
        }
