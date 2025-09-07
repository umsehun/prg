import { ChartMetadata } from '../../shared/types';
/**
 * assets 디렉토리를 스캔하여 .osz 파일을 직접 파싱해 차트를 발견합니다.
 * 각 폴더에서 .osz 파일을 찾아 파싱하여 정확한 메타데이터를 추출합니다.
 */
export declare function discoverCharts(): Promise<ChartMetadata[]>;
//# sourceMappingURL=chart-discovery.d.ts.map