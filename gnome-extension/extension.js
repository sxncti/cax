import Cairo from 'gi://cairo';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const REFRESH_SECONDS = 300;

function ringColor(percent) {
    if (percent >= 50)
        return [0.18, 0.80, 0.44, 1];
    if (percent >= 20)
        return [0.95, 0.67, 0.13, 1];
    return [0.91, 0.25, 0.20, 1];
}

const UsageRing = GObject.registerClass(class UsageRing extends St.Widget {
    _init(percent) {
        super._init({
            style_class: 'cax-ring',
            layout_manager: new Clutter.BinLayout(),
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._percent = Math.max(0, Math.min(100, percent));

        this._canvas = new St.DrawingArea({x_expand: true, y_expand: true});
        this._canvas.connect('repaint', area => this._draw(area));
        this.add_child(this._canvas);

        this.add_child(new St.Label({
            text: `${this._percent}`,
            style_class: 'cax-ring-label',
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        }));
    }

    _draw(area) {
        const cr = area.get_context();
        const [width, height] = area.get_surface_size();
        const radius = Math.min(width, height) / 2 - 2.5;
        const centerX = width / 2;
        const centerY = height / 2;

        cr.setLineWidth(3);
        cr.setLineCap(Cairo.LineCap.ROUND);
        cr.setSourceRGBA(1, 1, 1, 0.18);
        cr.arc(centerX, centerY, radius, 0, Math.PI * 2);
        cr.stroke();

        if (this._percent > 0) {
            const [red, green, blue, alpha] = ringColor(this._percent);
            cr.setSourceRGBA(red, green, blue, alpha);
            cr.arc(centerX, centerY, radius, -Math.PI / 2,
                -Math.PI / 2 + Math.PI * 2 * this._percent / 100);
            cr.stroke();
        }
        cr.$dispose();
    }
});

const CaxIndicator = GObject.registerClass(class CaxIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'CAX 5h Rings');
        this._box = new St.BoxLayout({style_class: 'cax-rings-box'});
        this.add_child(this._box);
        this._refreshId = 0;
        this._refresh();
        this._refreshId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT, REFRESH_SECONDS, () => {
                this._refresh();
                return GLib.SOURCE_CONTINUE;
            });
    }

    _refresh() {
        const installedLauncher = GLib.build_filenamev([
            GLib.get_home_dir(), '.local', 'bin', 'cax',
        ]);
        const launcher = GLib.file_test(installedLauncher, GLib.FileTest.IS_EXECUTABLE)
            ? installedLauncher
            : GLib.find_program_in_path('cax');
        if (!launcher) {
            this._render([], 'Comando cax não encontrado');
            return;
        }

        const proc = new Gio.Subprocess({
            argv: [launcher, 'bar-data'],
            flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE,
        });
        proc.init(null);
        proc.communicate_utf8_async(null, null, (source, result) => {
            try {
                const [, stdout] = source.communicate_utf8_finish(result);
                const accounts = stdout.trim().split('\n').filter(Boolean).map(line => {
                    const [number, email, percent, reset, weeklyPercent] = line.split('\t');
                    return {
                        number,
                        email,
                        percent: Number(percent),
                        reset,
                        weeklyPercent: Number(weeklyPercent),
                    };
                }).filter(account => Number.isFinite(account.percent));
                this._render(accounts, null);
            } catch (error) {
                logError(error, 'Falha ao atualizar CAX 5h Rings');
                this._render([], 'Limites indisponíveis');
            }
        });
    }

    _render(accounts, error) {
        this._box.destroy_all_children();
        this.menu.removeAll();

        if (accounts.length === 0) {
            this._box.add_child(new St.Label({
                text: 'CAX',
                style_class: 'cax-empty-label',
                y_align: Clutter.ActorAlign.CENTER,
            }));
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
                error ?? 'Nenhuma conta conectada', {reactive: false}));
        } else {
            for (const account of accounts) {
                const ring = new UsageRing(account.percent);
                const weeklyExhausted = account.percent > 0 && account.weeklyPercent === 0;
                if (weeklyExhausted)
                    ring.opacity = 90;
                ring.accessible_name = weeklyExhausted
                    ? `Conta ${account.number}: ${account.percent}% nas 5 horas, limite semanal esgotado`
                    : `Conta ${account.number}: ${account.percent}%`;
                this._box.add_child(ring);
                const weeklyStatus = account.weeklyPercent >= 0
                    ? `semana ${account.weeklyPercent}%`
                    : 'semana indisponível';
                const blockedStatus = weeklyExhausted ? ' · bloqueado' : '';
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
                    `Conta ${account.number} · ${account.email} · 5h ${account.percent}% · ${weeklyStatus} · ${account.reset}${blockedStatus}`,
                    {reactive: false}));
            }
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        const refresh = new PopupMenu.PopupMenuItem('Atualizar agora');
        refresh.connect('activate', () => this._refresh());
        this.menu.addMenuItem(refresh);
    }

    destroy() {
        if (this._refreshId) {
            GLib.source_remove(this._refreshId);
            this._refreshId = 0;
        }
        super.destroy();
    }
});

export default class CaxRingsExtension extends Extension {
    enable() {
        this._indicator = new CaxIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
