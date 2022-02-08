import { ForecastPoint } from "@src/clients/stormGlass";
import { Beach, GeoPosition } from "@src/models/beach";

const waveHeights = {
    ankleToKnee: {
        min: 0.3,
        max: 1.0,
    },
    waistHigh: {
        min: 1.0,
        max: 2.0,
    },
};

class Rating {
    constructor(private beach: Beach) {}

    public getRateForPoint(point: ForecastPoint): number {
        const swellPosition = this.getPositionFromLocation(
            point.swellDirection
        );

        const windDirection = this.getPositionFromLocation(point.windDirection);

        const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
            swellPosition,
            windDirection
        );

        const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
        const swellPeriodRating = this.getRatingForSwellPeriod(
            point.swellPeriod
        );

        return Math.round(
            (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3
        );
    }

    public getRatingBasedOnWindAndWavePositions(
        wavePosition: GeoPosition,
        windPosition: GeoPosition
    ): number {
        if (wavePosition === windPosition) {
            return 1;
        } else if (this.isWindOffShore(wavePosition, windPosition)) {
            return 5;
        }

        return 3;
    }

    public getRatingForSwellPeriod(period: number): number {
        if (period < 7) return 1;
        if (period < 10) return 2;
        if (period < 14) return 4;

        return 5;
    }

    public getRatingForSwellSize(height: number): number {
        if (height < waveHeights.ankleToKnee.min) return 1;
        if (height < waveHeights.ankleToKnee.max) return 2;
        if (height < waveHeights.waistHigh.max) return 3;

        return 5;
    }

    public getPositionFromLocation(coordinates: number): GeoPosition {
        if (coordinates < 50) return GeoPosition.N;
        if (coordinates < 120) return GeoPosition.E;
        if (coordinates < 220) return GeoPosition.S;
        if (coordinates < 310) return GeoPosition.W;

        return GeoPosition.N;
    }

    private isWindOffShore(
        wavePosition: GeoPosition,
        windPosition: GeoPosition
    ): boolean {
        return (
            (wavePosition === GeoPosition.N &&
                windPosition === GeoPosition.S &&
                this.beach.position === GeoPosition.N) ||
            (wavePosition === GeoPosition.S &&
                windPosition === GeoPosition.N &&
                this.beach.position === GeoPosition.S) ||
            (wavePosition === GeoPosition.E &&
                windPosition === GeoPosition.W &&
                this.beach.position === GeoPosition.E) ||
            (wavePosition === GeoPosition.W &&
                windPosition === GeoPosition.E &&
                this.beach.position === GeoPosition.W)
        );
    }
}

export { Rating };
