-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
('Cleaning', 'Sparkle'),
('Plumbing', 'Wrench'),
('Electrical', 'Zap'),
('Web Design', 'Globe'),
('Graphics', 'Palette'),
('Training', 'GraduationCap'),
('Catering', 'Utensils'),
('Security', 'Shield'),
('Construction', 'HardHat'),
('IT Support', 'Monitor'),
('Photography', 'Camera'),
('Legal', 'Scale'),
('Accounting', 'Calculator');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('CLIENT', 'SERVICE_PROVIDER', 'ADMIN')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service provider profiles
CREATE TABLE service_providers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    nin TEXT,
    business_reg_number TEXT,
    services_offered TEXT[],
    bio TEXT,
    portfolio_images TEXT[],
    location TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests for Service (RFS)
CREATE TABLE requests_for_service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    division TEXT NOT NULL,
    parish TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[],
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'AWARDED', 'COMPLETED', 'CANCELLED')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proposals
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfs_id UUID NOT NULL REFERENCES requests_for_service(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quote_amount DECIMAL(10,2) NOT NULL,
    timeline TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rfs_id, provider_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rfs_id UUID REFERENCES requests_for_service(id) ON DELETE CASCADE,
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kampala locations
CREATE TABLE kampala_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division TEXT NOT NULL,
    parish TEXT NOT NULL,
    ward TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Kampala divisions and parishes
INSERT INTO kampala_locations (division, parish, ward) VALUES
-- Central Division
('Central', 'Kampala Central', 'Nakasero'),
('Central', 'Kampala Central', 'Kampala'),
('Central', 'Old Kampala', 'Old Kampala'),
('Central', 'Kampala Central', 'Kisenyi'),
('Central', 'Kampala Central', 'Namirembe'),
-- Kawempe Division
('Kawempe', 'Kawempe', 'Kawempe'),
('Kawempe', 'Kawempe', 'Kazo'),
('Kawempe', 'Kawempe', 'Mpererwe'),
('Kawempe', 'Kawempe', 'Kanyanya'),
('Kawempe', 'Kawempe', 'Kyebando'),
-- Makindye Division
('Makindye', 'Makindye', 'Makindye'),
('Makindye', 'Makindye', 'Lukuli'),
('Makindye', 'Makindye', 'Kibuye'),
('Makindye', 'Makindye', 'Ndeeba'),
('Makindye', 'Makindye', 'Luwafu'),
-- Nakawa Division
('Nakawa', 'Nakawa', 'Nakawa'),
('Nakawa', 'Nakawa', 'Naguru'),
('Nakawa', 'Nakawa', 'Banda'),
('Nakawa', 'Nakawa', 'Kyambogo'),
('Nakawa', 'Nakawa', 'Mbuya'),
-- Rubaga Division
('Rubaga', 'Rubaga', 'Rubaga'),
('Rubaga', 'Rubaga', 'Nalukolongo'),
('Rubaga', 'Rubaga', 'Kabusu'),
('Rubaga', 'Rubaga', 'Mutungo'),
('Rubaga', 'Rubaga', 'Nateete');

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests_for_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Service providers policies
CREATE POLICY "Anyone can view service providers" ON service_providers
    FOR SELECT USING (true);

CREATE POLICY "Providers can update their own profile" ON service_providers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Providers can insert their own profile" ON service_providers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Requests for service policies
CREATE POLICY "Anyone can view open RFS" ON requests_for_service
    FOR SELECT USING (status = 'OPEN' OR auth.uid() = client_id);

CREATE POLICY "Clients can insert their own RFS" ON requests_for_service
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own RFS" ON requests_for_service
    FOR UPDATE USING (auth.uid() = client_id);

-- Proposals policies
CREATE POLICY "Providers can view proposals they submitted" ON proposals
    FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Clients can view proposals for their RFS" ON proposals
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM requests_for_service
        WHERE id = proposals.rfs_id AND client_id = auth.uid()
    ));

CREATE POLICY "Providers can insert their own proposals" ON proposals
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own proposals" ON proposals
    FOR UPDATE USING (auth.uid() = provider_id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE ON service_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rfs_updated_at
    BEFORE UPDATE ON requests_for_service
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
