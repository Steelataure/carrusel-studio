/**
 * In-browser MP4 (ISO-BMFF) header patcher for MediaRecorder recordings.
 *
 * Background:
 * Chromium's MediaRecorder outputs fragmented MP4 (`fMP4`) with `mvhd` duration = 0
 * and `tkhd` duration = 0. Standard media players (Windows Media Player, QuickTime,
 * Explorer, iOS, social uploaders) cannot read the video length or seek properly,
 * often cutting off after the first fragment buffer (~8-9 seconds).
 *
 * This function locates the `moov` box and writes the true total duration into
 * `mvhd`, all `tkhd` (track headers), and all `mdhd` (media headers).
 */
export async function fixMp4Duration(blob: Blob, durationMs: number): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);
    let offset = 0;
    let movieTimescale = 1000;
    let movieDurationUnits = Math.round(durationMs);

    while (offset < arrayBuffer.byteLength - 8) {
      const size = view.getUint32(offset);
      // Box type as ASCII 4-char string
      const type = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );

      if (type === "moov") {
        let sub = offset + 8;
        const moovEnd = offset + size;

        // 1. Pass: Find mvhd to get movie timescale and patch movie duration
        while (sub < moovEnd - 8) {
          const sSize = view.getUint32(sub);
          const sType = String.fromCharCode(
            view.getUint8(sub + 4),
            view.getUint8(sub + 5),
            view.getUint8(sub + 6),
            view.getUint8(sub + 7)
          );

          if (sType === "mvhd") {
            const version = view.getUint8(sub + 8);
            // version 1: 64-bit creation/mod times -> timescale is at offset 28
            // version 0: 32-bit creation/mod times -> timescale is at offset 20
            movieTimescale = view.getUint32(sub + (version === 1 ? 28 : 20));
            if (movieTimescale === 0) movieTimescale = 1000;
            movieDurationUnits = Math.round((durationMs / 1000) * movieTimescale);

            if (version === 1) {
              view.setBigUint64(sub + 32, BigInt(movieDurationUnits));
            } else {
              view.setUint32(sub + 24, movieDurationUnits);
            }
          }
          sub += sSize;
        }

        // 2. Pass: Patch each trak (tkhd & mdhd) with exact track duration
        sub = offset + 8;
        while (sub < moovEnd - 8) {
          const sSize = view.getUint32(sub);
          const sType = String.fromCharCode(
            view.getUint8(sub + 4),
            view.getUint8(sub + 5),
            view.getUint8(sub + 6),
            view.getUint8(sub + 7)
          );

          if (sType === "trak") {
            let trakSub = sub + 8;
            const trakEnd = sub + sSize;

            while (trakSub < trakEnd - 8) {
              const tSize = view.getUint32(trakSub);
              const tType = String.fromCharCode(
                view.getUint8(trakSub + 4),
                view.getUint8(trakSub + 5),
                view.getUint8(trakSub + 6),
                view.getUint8(trakSub + 7)
              );

              if (tType === "tkhd") {
                const version = view.getUint8(trakSub + 8);
                // tkhd duration is ALWAYS expressed in the movie timescale
                if (version === 1) {
                  view.setBigUint64(trakSub + 36, BigInt(movieDurationUnits));
                } else {
                  view.setUint32(trakSub + 28, movieDurationUnits);
                }
              } else if (tType === "mdia") {
                let mSub = trakSub + 8;
                const mEnd = trakSub + tSize;
                while (mSub < mEnd - 8) {
                  const mdSize = view.getUint32(mSub);
                  const mdType = String.fromCharCode(
                    view.getUint8(mSub + 4),
                    view.getUint8(mSub + 5),
                    view.getUint8(mSub + 6),
                    view.getUint8(mSub + 7)
                  );
                  if (mdType === "mdhd") {
                    const version = view.getUint8(mSub + 8);
                    const trackTimescale = view.getUint32(mSub + (version === 1 ? 28 : 20));
                    if (trackTimescale > 0) {
                      const trackDurUnits = Math.round((durationMs / 1000) * trackTimescale);
                      if (version === 1) {
                        view.setBigUint64(mSub + 32, BigInt(trackDurUnits));
                      } else {
                        view.setUint32(mSub + 24, trackDurUnits);
                      }
                    }
                  }
                  mSub += mdSize;
                }
              }
              trakSub += tSize;
            }
          }
          sub += sSize;
        }
        break; // Finished patching moov
      }

      if (size === 0 || size === 1) break;
      offset += size;
    }

    return new Blob([arrayBuffer], { type: blob.type || "video/mp4" });
  } catch (err) {
    console.warn("Failed to patch MP4 duration header:", err);
    return blob;
  }
}
