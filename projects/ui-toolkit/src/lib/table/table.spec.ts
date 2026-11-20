import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Table, TableCell, type TableColumn } from './table';

interface Row { id: number; squadra: string; pt: number }

@Component({
  imports: [Table, TableCell],
  template: `<ui-table caption="Classifica girone A" [columns]="cols" [rows]="rows" rowKey="id" [rowLink]="link" stack>
    <ng-template uiCell="pt" let-value="value"><strong class="pt">{{ value }} pt</strong></ng-template>
  </ui-table>`,
})
class Host {
  cols: TableColumn<Row>[] = [
    { key: 'squadra', label: 'Squadra', primary: true },
    { key: 'pt', label: 'Punti', numeric: true },
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
    expect([...el.querySelectorAll('thead th')].map((t) => t.getAttribute('scope'))).toEqual(['col', 'col']);
    const rows = el.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelectorAll('a')).toHaveLength(1);
    expect(rows[0].querySelector('a')!.getAttribute('href')).toBe('/squadre/1');
    expect(rows[0].querySelector('th[scope=row]')!.textContent).toContain('Leoni');
    expect(rows[1].querySelector('.pt')!.textContent).toBe('9 pt');
    expect(rows[1].querySelector('td')!.getAttribute('data-label')).toBe('Punti');
  });
});
