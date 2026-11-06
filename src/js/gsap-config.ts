import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// 全体をとおした プラグイン登録
gsap.registerPlugin( ScrollTrigger, ScrambleTextPlugin );

export { gsap, ScrollTrigger, ScrambleTextPlugin }

