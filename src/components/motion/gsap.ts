// Client-only motion module, loaded after first paint by load.ts (DESIGN §7.0). Registers the
// house eases so GSAP timings match the CSS tokens exactly.
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, CustomEase)
CustomEase.create('mb.out', '0.16,1,0.3,1')
CustomEase.create('mb.inOut', '0.65,0,0.35,1')
CustomEase.create('mb.in', '0.7,0,0.84,0')
CustomEase.create('mb.twist', '0.83,0,0.17,1')
gsap.defaults({ ease: 'expo.out' })

export { gsap, ScrollTrigger }
