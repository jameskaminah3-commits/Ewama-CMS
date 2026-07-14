import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Heart, Home as HomeIcon, Handshake, Sprout, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

const COMMITMENTS = [
  { icon: ShieldCheck, text: 'To conduct business with integrity.' },
  { icon: Users, text: 'To put people at the centre of every decision.' },
  { icon: Heart, text: 'To support initiatives that uplift communities.' },
  { icon: Sprout, text: 'To encourage responsible and sustainable development.' },
  { icon: Handshake, text: 'To build relationships founded on honesty, respect, and trust.' },
];

export default function Communities() {
  return (
    <PublicLayout>
      <Seo
        title="Building Communities"
        description="At EWAMA Properties, real estate is ultimately about people. Discover how we create opportunities, restore hope, and build communities where families thrive."
      />

      <PageHeader
        kicker="Our Impact"
        title="Building Communities"
        subtitle="Beyond Property. Beyond Transactions."
      />

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="max-w-3xl mx-auto">

          {/* Opening */}
          <motion.div {...fadeUp} className="prose prose-lg max-w-none text-gray-600 mb-16">
            <p className="text-2xl font-heading text-primary leading-relaxed">
              At EWAMA Properties Ltd, we believe that real estate is ultimately about people.
            </p>
            <p>
              A plot of land is more than a parcel defined by boundaries — it is the place where families build homes,
              children create memories, businesses begin, and dreams take shape. Every property we help someone acquire
              represents a new chapter in their story.
            </p>
            <p>
              That's why our work extends beyond selling land. We are committed to creating opportunities, restoring hope,
              and building communities where people can thrive. This commitment is at the heart of our promise:{' '}
              <strong className="text-primary">Foundation of Trust.</strong>
            </p>
          </motion.div>

          {/* Impact stat */}
          <motion.div {...fadeUp} className="bg-secondary/10 border border-secondary/20 rounded-2xl p-10 text-center mb-16">
            <div className="w-14 h-14 mx-auto bg-secondary text-white rounded-2xl flex items-center justify-center mb-5">
              <HomeIcon className="w-7 h-7" />
            </div>
            <p className="text-5xl font-heading font-bold text-primary mb-3">10+</p>
            <p className="text-lg text-gray-700 max-w-md mx-auto">
              families helped to find stability and begin new chapters in their lives through our social initiatives.
            </p>
          </motion.div>

          {/* Purpose */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">Our Purpose</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="font-medium text-gray-800">We measure success differently.</p>
              <p>
                While every completed transaction is important, our greatest achievement is seeing lives transformed through
                secure property ownership. Helping a family find a place to call home or enabling an investor to build a
                lasting legacy is the true impact of our work.
              </p>
              <p>
                We believe that when people have access to secure property, they gain more than an asset — they gain
                confidence, stability, and the freedom to plan for the future.
              </p>
            </div>
          </motion.div>

          {/* Communities that last */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">Building Communities That Last</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Thriving communities don't happen by chance. They are built through thoughtful planning, responsible
                development, and genuine partnerships. That's why we seek opportunities that promote long-term growth,
                encourage sustainable development, and create environments where people can live, work, and prosper together.
              </p>
              <p>
                For us, success is not measured only by the number of plots sold, but by the strength of the communities
                that emerge around them.
              </p>
            </div>
          </motion.div>

          {/* Commitments */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-8">Our Commitment</h2>
            <div className="space-y-4">
              {COMMITMENTS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Looking ahead */}
          <motion.div {...fadeUp} className="bg-primary rounded-2xl p-10 md:p-14 text-center">
            <h2 className="text-3xl font-heading font-bold text-white mb-6">Looking Ahead</h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              The future we envision is one where more families own property, more investors build lasting wealth,
              and more communities flourish through responsible development.
            </p>
            <div className="font-heading text-xl md:text-2xl text-white leading-relaxed mb-10">
              <p>Together, we can build more than houses.</p>
              <p className="text-secondary">We can build opportunity. We can build hope.</p>
              <p>We can build communities — and a future founded on trust.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/properties">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-12 px-8">
                  Explore Our Projects
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-12 px-8 bg-white/10 hover:bg-white/20 text-white border-white/25">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </PublicLayout>
  );
}
