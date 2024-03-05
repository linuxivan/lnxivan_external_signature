# Copyright Ivan Perez Louzan <http://www.lnxivan.com>
from odoo import models, fields, api


class SignatureScreen(models.Model):
    _name = 'signature.screen'
    _description = 'Signature Screen'

    name = fields.Char(string='Name')
    text = fields.Text(string='Text')
    description = fields.Text(string='Description')
    image = fields.Binary(string='Image')

    signature_session_id = fields.One2many('signature.session', 'signature_screen_id', string='Signature Session')

    def action_start_session(self):
        if self.signature_session_id.filtered(lambda s: s.state == 'started'):
            return {
                'warning': {
                    'title': "Warning",
                    'message': "There is a session started already",
                }
            }
        session = self.env['signature.session'].create({
            'signature_screen_id': self.id,
            'user_id': self.env.user.id,
            'state': 'draft'
        })


class SignatureSession(models.Model):
    _name = 'signature.session'
    _description = 'Signature Session'

    name = fields.Char(string='Name', store=True, compute='_compute_name')

    @api.depends('signature_screen_id', 'user_id', 'date')
    def _compute_name(self):
        for record in self:
            record.name = f"'Signature Session' - {record.user_id.name} - {record.date}"

    signature_screen_id = fields.Many2one('signature.screen', string='Signature Screen')
    image = fields.Binary(string='Image', related='signature_screen_id.image')
    text = fields.Text(string='Text', related='signature_screen_id.text')
    description = fields.Text(string='Description', related='signature_screen_id.description')
    signature = fields.Binary(string='Signature', default=False)
    user_id = fields.Many2one('res.users', string='User')
    date = fields.Datetime(string='Date', default=fields.Datetime.now)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('started', 'Started'),
        ('done', 'Done'),
    ], string='State', default='draft')

    picking_id = fields.Many2one('stock.picking', string='Picking', default=False)

    end_date = fields.Datetime(string='End Date', default=False)

    def continue_session(self):
        return {
            'name': 'Signature Session',
            'type': 'ir.actions.act_window',
            'res_model': 'signature.session',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'current',
        }

    def action_done(self):
        self.end_date = fields.Datetime.now()
        self.state = 'done'
        return True

    def action_start(self):
        self.state = 'started'
        return True

    def action_draft(self):
        self.state = 'draft'
        return True

    @api.model
    def create(self, values):
        record = super(SignatureSession, self).create(values)
        existing_sessions = self.search(
            [('user_id', '=', record.user_id.id), ('state', '=', 'draft'), ('id', '!=', record.id)])
        if existing_sessions:
            raise ValueError("There is a session started already")
