import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Chart, UI_CHART_LOADER, type ChartConstructor, type ChartData } from './chart';

@Component({
  imports: [Chart],
  template: `<ui-chart type="bar" [data]="data" ariaLabel="Gol per giornata" [dataTable]="table()"><p class="own">Tabella dell'app</p></ui-chart>`,
})
class Host {
  data: ChartData = { labels: ['G1', 'G2'], datasets: [{ label: 'Gol', data: [3, 5] }] };
  table = signal(true);
}

describe('Chart', () => {
  it('usa il costruttore fornito; la tabella sr-only si può spegnere', async () => {
    const built: unknown[] = [];
    class FakeChart {
      data: ChartData;
      options = {};
      constructor(_el: HTMLCanvasElement, cfg: { data: ChartData }) {
        this.data = cfg.data;
        built.push(cfg);
      }
      update() {}
      destroy() {}
      isDatasetVisible() { return true; }
      setActiveElements() {}
    }
    TestBed.configureTestingModule({ providers: [{ provide: UI_CHART_LOADER, useValue: async () => FakeChart as unknown as ChartConstructor }] });
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    await new Promise((r) => setTimeout(r));
    expect(built).toHaveLength(1);
    expect(f.nativeElement.querySelector('.sr-only > table caption')?.textContent).toContain('Gol per giornata');
    expect(f.nativeElement.querySelector('table.sr-only')).toBeNull();
    f.componentInstance.table.set(false);
    await f.whenStable();
    expect(f.nativeElement.querySelector('table')).toBeNull();
    expect(f.nativeElement.querySelector('ui-chart .own')?.textContent).toContain("Tabella dell'app");
  });
});
