import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideUiLinkHandler } from '../util/link';
import { Table, TableCell, TableHeader, TableRowDetail, type TableColumn } from './table';

interface Row { id: number; squadra: string; pt: number }

@Component({
  imports: [Table, TableCell],
  template: `<ui-table caption="Classifica girone A" [columns]="cols" [rows]="rows" rowKey="id" [rowLink]="link" stack>
    <ng-template uiCell="pt" let-value="value"><strong class="pt">{{ value }} pt</strong></ng-template>
    <ng-template uiCell="pos" let-i="index"><span class="pos">{{ i + 1 }}</span></ng-template>
  </ui-table>`,
})
class Host {
  cols: TableColumn<Row>[] = [
    { key: 'squadra', label: 'Squadra', primary: true },
    { key: 'pt', label: 'Punti', numeric: true },
    { key: 'pos', label: 'Pos', hideOnMobile: true },
  ];
  rows: Row[] = [
    { id: 1, squadra: 'Leoni', pt: 12 },
    { id: 2, squadra: 'Falchi', pt: 9 },
  ];
  link = (r: Row) => (r.id === 2 ? ['/squadre', r.id] : `/squadre/${r.id}`);
}

describe('Table', () => {
  it('caption, intestazioni, riga navigabile con un solo link, template di cella', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelector('caption')!.textContent).toContain('Classifica girone A');
    expect(el.querySelector('caption')!.classList).toContain('sr-only');
    expect([...el.querySelectorAll('thead th')].map((t) => t.getAttribute('scope'))).toEqual(['col', 'col', 'col']);
    const rows = el.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelectorAll('a')).toHaveLength(1);
    expect(rows[0].querySelector('a')!.getAttribute('href')).toBe('/squadre/1');
    expect(rows[0].querySelector('th[scope=row]')!.textContent).toContain('Leoni');
    expect(rows[1].querySelector('a')!.getAttribute('href')).toBe('/squadre/2');
    expect(rows[1].querySelector('.pt')!.textContent).toBe('9 pt');
    expect(rows[1].querySelector('td')!.getAttribute('data-label')).toBe('Punti');
  });

  it('indice nel contesto cella e colonne nascoste su mobile', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    expect([...el.querySelectorAll('.pos')].map((p) => p.textContent)).toEqual(['1', '2']);
    expect(el.querySelectorAll('.hide-mobile')).toHaveLength(3);
  });

  it('il gestore dei link dell\'app intercetta i click semplici', async () => {
    const handler = vi.fn(() => true);
    TestBed.configureTestingModule({ providers: [provideUiLinkHandler(handler)] });
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const a = f.nativeElement.querySelector('tbody a') as HTMLAnchorElement;
    const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    a.dispatchEvent(plain);
    expect(handler).toHaveBeenCalledWith('/squadre/1', plain);
    expect(plain.defaultPrevented).toBe(true);
    const withCtrl = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
    a.dispatchEvent(withCtrl);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(withCtrl.defaultPrevented).toBe(false);
  });

  describe('totale, intestazioni, dettaglio, colonne fisse', () => {
    interface Line { id: string; name: string; amount: number }
    @Component({
      imports: [Table, TableCell, TableHeader, TableRowDetail],
      template: `<ui-table caption="Report" [columns]="cols" [rows]="rows" rowKey="id" [footer]="total" [rowExpanded]="open" scrollable>
        <ng-template uiHeader="amount" let-column><span class="head">{{ column.label }} (€)</span></ng-template>
        <ng-template uiCell="amount" let-value="value" let-footer="footer"><span [class.tot]="footer">{{ value }}</span></ng-template>
        <ng-template uiRowDetail let-row><p class="det">Dettaglio {{ row.name }}</p></ng-template>
      </ui-table>`,
    })
    class Rich {
      cols: TableColumn<Line>[] = [
        { key: 'name', label: 'Voce', primary: true, sticky: true },
        { key: 'amount', label: 'Importo', numeric: true, class: 'money' },
      ];
      rows: Line[] = [{ id: 'a', name: 'Quote', amount: 100 }, { id: 'b', name: 'Arbitri', amount: -30 }];
      total: Line = { id: 't', name: 'Totale', amount: 70 };
      open = (r: Line) => r.id === 'b';
    }

    it('riga di totale in tfoot con gli stessi template, intestazione custom, dettaglio e classi', async () => {
      const f = TestBed.createComponent(Rich);
      await f.whenStable();
      const el: HTMLElement = f.nativeElement;
      expect(el.querySelector('thead .head')?.textContent).toBe('Importo (€)');
      expect(el.querySelector('tfoot th[scope=row]')?.textContent).toContain('Totale');
      expect(el.querySelector('tfoot .tot')?.textContent).toBe('70');
      expect(el.querySelectorAll('tbody tr.detail')).toHaveLength(1);
      expect(el.querySelector('tbody tr.detail td')?.getAttribute('colspan')).toBe('2');
      expect(el.querySelector('.det')?.textContent).toContain('Arbitri');
      expect(el.querySelectorAll('.sticky')).toHaveLength(4);
      expect(el.querySelectorAll('td.money')).toHaveLength(3);
      expect(el.querySelector('table')?.classList).toContain('scrollable');
      expect(el.querySelector('table')?.classList).not.toContain('compact');
    });
  });
});
