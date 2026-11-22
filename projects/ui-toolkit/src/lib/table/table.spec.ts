import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideUiLinkHandler } from '../util/link';
import { Table, TableCell, type TableColumn } from './table';

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
  link = (r: Row) => `/squadre/${r.id}`;
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
});
