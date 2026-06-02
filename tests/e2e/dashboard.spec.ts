import { test, expect } from '@playwright/test';

test.describe('스마트팩토리 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('대시보드 셸과 상단 브랜드가 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/스마트팩토리/);
    await expect(page.getByText('SMF', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('main', { name: '공장 관제 대시보드' })).toBeVisible();
  });

  test('4개 도메인 패널이 모두 렌더된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'OEE · 가동 현황' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '설비 모니터링' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '시간대별 산출량' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '전력 사용 & 불량 분석' })).toBeVisible();
  });

  test('상단 KPI에 종합 OEE가 백분율로 표시된다', async ({ page }) => {
    const oeeKpi = page.locator('.topbar__kpi', { hasText: '종합 OEE' });
    await expect(oeeKpi).toBeVisible();
    await expect(oeeKpi.locator('.topbar__kpi-val')).toHaveText(/\d+(\.\d+)?%/);
  });

  test('OEE 게이지가 접근 가능한 레이블을 노출한다', async ({ page }) => {
    await expect(page.getByRole('img', { name: /OEE \d+(\.\d+)?%/ })).toBeVisible();
  });

  test('LIVE 토글로 시뮬레이션을 일시정지/재개할 수 있다', async ({ page }) => {
    const liveBtn = page.getByRole('button', { name: /LIVE|일시정지/ });
    await expect(liveBtn).toHaveAttribute('aria-pressed', 'true');

    await liveBtn.click();
    await expect(liveBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(liveBtn).toContainText('일시정지');

    await liveBtn.click();
    await expect(liveBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(liveBtn).toContainText('LIVE');
  });

  test('일시정지 상태에서 교대조 누적 시계가 멈춘다', async ({ page }) => {
    const liveBtn = page.getByRole('button', { name: /LIVE|일시정지/ });
    const clock = page.locator('.topbar__clock-val');

    await liveBtn.click(); // pause
    const frozen = await clock.textContent();
    await page.waitForTimeout(2000); // 1.5s tick 한 번 이상 경과
    await expect(clock).toHaveText(frozen ?? '');
  });

  test('센서 패널이 6개 센서 측정값을 렌더한다', async ({ page }) => {
    await expect(page.locator('.sensor')).toHaveCount(6);
  });
});
