import Link from "next/link"
import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black py-10 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <p className="mb-4">Questions? Contact us.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">FAQ</Link></li>
                <li><Link href="#" className="hover:underline">Investor Relations</Link></li>
                <li><Link href="#" className="hover:underline">Privacy</Link></li>
                <li><Link href="#" className="hover:underline">Speed Test</Link></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">Help Center</Link></li>
                <li><Link href="#" className="hover:underline">Jobs</Link></li>
                <li><Link href="#" className="hover:underline">Cookie Preferences</Link></li>
                <li><Link href="#" className="hover:underline">Legal Notices</Link></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">Account</Link></li>
                <li><Link href="#" className="hover:underline">Ways to Watch</Link></li>
                <li><Link href="#" className="hover:underline">Corporate Information</Link></li>
                <li><Link href="#" className="hover:underline">Only on CineWhiz</Link></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">Media Center</Link></li>
                <li><Link href="#" className="hover:underline">Terms of Use</Link></li>
                <li><Link href="#" className="hover:underline">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-1 text-sm">
            <span>Made with</span> 
            <Heart className="h-4 w-4 text-red-600 fill-red-600" /> 
            <span>by</span> 
            <Link href="https://fragnite.vercel.app" className="text-white hover:underline">Fragnite</Link>
          </div>
          <p className="mt-4 text-xs">© 2025 CineWhiz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}