import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">Agon</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              The competitive hiring platform connecting ambitious students with
              leading tech companies through real-world hackathons.
            </p>
          </div>
          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/student" className="hover:text-white transition-colors">Browse Competitions</Link></li>
              <li><Link href="/company/competitions/new" className="hover:text-white transition-colors">Post a Challenge</Link></li>
              <li><Link href="/auth" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="cursor-default">About</span></li>
              <li><span className="cursor-default">Blog</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Agon. All rights reserved.</p>
          <p className="text-xs text-gray-600">Built with Next.js + Django</p>
        </div>
      </div>
    </footer>
  );
}
