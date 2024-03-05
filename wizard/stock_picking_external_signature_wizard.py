# Copyright Ivan Perez Louzan <http://www.lnxivan.com>
from odoo import models, fields, api
from odoo.exceptions import UserError


class StockPickingExternalSignatureWizard(models.TransientModel):
    _name = 'stock.picking.external.signature.wizard'
    _description = 'Stock Picking External Signature Wizard'

    picking_id = fields.Many2one('stock.picking', string='Picking', default=False)
    signature_session_id = fields.Many2one('signature.session', string='Signature Session')
    signature = fields.Binary(string='Signature')

    status = fields.Selection([
        ('draft', 'Draft'),
        ('requested', 'requested'),
        ('done', 'Done'),
    ], string='Status', default='draft')

    def get_signature_session_id(self):
        for record in self:
            signature_session = self.env['signature.session'].search(
                [('user_id', '=', self.env.user.id), ('state', '=', 'draft')])
            if not signature_session:
                raise UserError("There is no session started")
            record.signature_session_id = signature_session.id

    def request_signature(self):
        self.ensure_one()
        self.get_signature_session_id()
        self.status = 'requested'
        self.signature_session_id.write({
            'picking_id': self.picking_id.id,
        })
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'stock.picking.external.signature.wizard',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }

    def action_get_signature(self):
        self.ensure_one()
        self.signature = self.signature_session_id.signature
        self.signature_session_id.write({
            'picking_id': False,
            'signature': False,
        })
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'stock.picking.external.signature.wizard',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }

    def sign_picking(self):
        self.ensure_one()
        self.picking_id.write({
            'signature': self.signature
        })

