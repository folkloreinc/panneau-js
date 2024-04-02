import useNativeVideo from './useNativeVideo';
import useVimeo from './useVimeo';
import useYouTube from './useYouTube';

const useVideo = (url, { type = null, ...opts }) => {
    const vimeo = useVimeo(type === 'vimeo' ? url : null, type === 'vimeo' ? opts : {});
    const youtube = useYouTube(type === 'youtube' ? url : null, type === 'youtube' ? opts : {});
    const native = useNativeVideo(type === null ? url : null, type === null ? opts : {});
    return {
        ...(type === 'vimeo' ? vimeo : null),
        ...(type === 'youtube' ? youtube : null),
        ...(type === null ? native : null),
    };
};

export default useVideo;
