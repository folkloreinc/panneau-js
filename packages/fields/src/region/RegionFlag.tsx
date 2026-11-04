import { cx } from '../shared/cx';
import styles from './RegionFlag.module.css';
import { getRegionFlag, useRegionFlags } from './flags';

/** A decorative image of a flag: the name of its region is next to it. */
export function FlagImage({ src, className }: { src: string; className?: string | undefined }) {
    return <img src={src} alt="" className={cx(styles.flag, className)} />;
}

/** Props of `RegionFlag`: the region, by its country and its code. */
export interface RegionFlagProps {
    /** The country of the region (`CA`). */
    country: string | null | undefined;
    /** The code of the region, without its country (`QC`). */
    code: string;
    /** A class of the image, which has the size of a flag emoji. */
    className?: string;
}

/**
 * The flag of a region, as an image with an empty `alt`, for a name next to it. Nothing while the
 * flags of its country load, nor for a region without a flag.
 */
export function RegionFlag({ country, code, className }: RegionFlagProps) {
    const src = getRegionFlag(useRegionFlags(country), code);
    return src !== undefined ? <FlagImage src={src} className={className} /> : null;
}
