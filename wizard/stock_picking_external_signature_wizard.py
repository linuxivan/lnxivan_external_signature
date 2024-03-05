# Copyright Ivan Perez Louzan <http://www.lnxivan.com>
from odoo import models, fields, api
from odoo.exceptions import UserError


class StockPickingExternalSignatureWizard(models.TransientModel):
    _name = 'stock.picking.external.signature.wizard'
    _description = 'Stock Picking External Signature Wizard'

    picking_id = fields.Many2one('stock.picking', string='Picking', default=False)
    signature_session_id = fields.Many2one('signature.session', string='Signature Session',
                                           compute='_compute_signature_session_id')
    signature = fields.Binary(string='Signature')

    def _compute_signature_session_id(self):
        for record in self:
            signature_session = self.env['signature.session'].search(
                [('user_id', '=', self.env.user.id), ('state', '=', 'started')])
            if not signature_session:
                raise UserError("There is no session started")
            record.signature_session_id = signature_session.id

    def request_signature(self):
        self.ensure_one()
        self.signature_session_id.write({
            'picking_id': self.picking_id.id,
        })

    def action_get_signature(self):
        self.ensure_one()
        self.signature = self.signature_session_id.signature
        self.signature_session_id.write({
            'picking_id': False,
        })

    def sign_picking(self):
        self.ensure_one()
        self.picking_id.write({
            'signature': self.signature
        })
        self.picking_id.action_done()
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'stock.picking',
            'view_mode': 'form',
            'res_id': self.picking_id.id,
            'target': 'current',
        }
