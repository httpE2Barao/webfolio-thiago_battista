"use client";

import {
  FiActivity,
  FiGrid,
  FiPlus,
  FiShoppingCart,
  FiTag,
  FiUpload,
  FiUser,
  FiX
} from 'react-icons/fi';

import { AdminDashboardSkeleton } from '@/components/LoadingStates';
import { AdminSidebar } from './_components/AdminSidebar';
import { CoverManagerModal } from './_components/CoverManagerModal';
import { TabAlbuns } from './_components/TabAlbuns';
import { TabGerenciarAlbum } from './_components/TabGerenciarAlbum';
import { TabOverview } from './_components/TabOverview';
import { TabPedidos } from './_components/TabPedidos';
import { TabTaxonomia } from './_components/TabTaxonomia';
import { TabType, useAdminData } from './_hooks/useAdminData';

export default function AdminDashboard() {
  const {
    isAuthenticated,
    authPassword, setAuthPassword,
    activeTab, setActiveTab,
    isLoading,
    isCheckingAuth,
    albumName, setAlbumName,
    description, setDescription,
    selectedCategoria, setSelectedCategoria,
    isPrivateUpload, setIsPrivateUpload,
    accessPasswordUpload, setAccessPasswordUpload,
    basePriceUpload, setBasePriceUpload,
    baseLimitUpload, setBaseLimitUpload,
    extraPriceUpload, setExtraPriceUpload,
    statusMessage, setStatusMessage,
    dragActive, setDragActive,
    uploadProgress, setUploadProgress,
    files, setFiles,
    albuns,
    orders,
    dbCategories,
    dbTags,
    selectedTags,
    allCategoriesList, allTagsList, stats,
    selectedAlbumForCover, setSelectedAlbumForCover,
    coverType, setCoverType,
    albumPhotos,
    isPhotoLoading,
    managedAlbum, setManagedAlbum,
    managedImages, setManagedImages,
    handleLogin, handleLogout, handleTagChange, handleUpload,
    handleDeleteAlbum, startEdit, handleSaveVenda,
    handleMoveAlbum, handleSetCover, handleDeletePhoto, handleSortPhotos,
    handleReorderCategories, handleReorderTags,
    refreshAlbumPhotos
  } = useAdminData();

  const menuItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Visão Geral', icon: FiActivity },
    { id: 'albuns', label: 'Álbuns & Upload', icon: FiGrid },
    { id: 'pedidos', label: 'Vendas & Pedidos', icon: FiShoppingCart },
    { id: 'taxonomia', label: 'Tags & Categorias', icon: FiTag },
  ];

  if (isCheckingAuth) {
    return (
      <div className="font-mono min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <FiActivity size={40} className="text-blue-500 animate-pulse mb-4" />
        <h1 className="text-xl font-black tracking-tighter uppercase animate-pulse">Validando Acesso...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="font-mono min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <h1 className="text-3xl font-black mb-8 tracking-tighter uppercase">Admin Central</h1>
        <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-gray-500 uppercase font-bold ml-1">Senha de Acesso</span>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all"
                placeholder="Digite a senha..."
              />
            </label>
            <button type="submit" className="bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase">Entrar no Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col pt-12">
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8">
        <section className="flex flex-col lg:flex-row gap-8 min-h-[85vh] mb-20">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
            menuItems={menuItems}
            FiUser={FiUser}
            FiX={FiX}
          />

          <div className="flex-1">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sistema Operacional • Live</span>
                </div>
              </div>

              {statusMessage && (
                <div className={`px-6 py-3 rounded-2xl border text-xs font-bold animate-in slide-in-from-top-4 duration-300 ${statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                  statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                  {statusMessage.text}
                </div>
              )}
            </div>

            {isLoading ? (
              <AdminDashboardSkeleton />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <TabOverview
                    stats={stats}
                    orders={orders}
                    setActiveTab={setActiveTab}
                    FiUpload={FiUpload}
                    FiPlus={FiPlus}
                    FiTag={FiTag}
                  />
                )}

                {activeTab === 'albuns' && (
                  <TabAlbuns
                    albumName={albumName} setAlbumName={setAlbumName}
                    description={description} setDescription={setDescription}
                    selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
                    allCategoriesList={allCategoriesList}
                    isPrivateUpload={isPrivateUpload} setIsPrivateUpload={setIsPrivateUpload}
                    accessPasswordUpload={accessPasswordUpload} setAccessPasswordUpload={setAccessPasswordUpload}
                    basePriceUpload={basePriceUpload} setBasePriceUpload={setBasePriceUpload}
                    baseLimitUpload={baseLimitUpload} setBaseLimitUpload={setBaseLimitUpload}
                    extraPriceUpload={extraPriceUpload} setExtraPriceUpload={setExtraPriceUpload}
                    files={files} setFiles={setFiles}
                    dragActive={dragActive} setDragActive={setDragActive}
                    isLoading={isLoading}
                    handleUpload={handleUpload}
                    albuns={albuns}
                    handleMoveAlbum={handleMoveAlbum}
                    handleDeleteAlbum={handleDeleteAlbum}
                    setSelectedAlbumForCover={setSelectedAlbumForCover}
                    setActiveTab={setActiveTab}
                    setManagedAlbum={setManagedAlbum}
                    refreshAlbumPhotos={refreshAlbumPhotos}
                  />
                )}

                {activeTab === 'gerenciar_album' && (
                  <TabGerenciarAlbum
                    managedAlbum={managedAlbum}
                    managedImages={managedImages}
                    setManagedAlbum={setManagedAlbum}
                    setManagedImages={setManagedImages}
                    setActiveTab={setActiveTab}
                    handleSaveVenda={handleSaveVenda}
                    handleDeleteAlbum={(id) => handleDeleteAlbum(id, managedAlbum?.titulo || '')}
                    handleDeletePhoto={handleDeletePhoto}
                    handleSortPhotos={handleSortPhotos}
                    handleUpload={handleUpload}
                    setSelectedAlbumForCover={setSelectedAlbumForCover}
                    statusMessage={statusMessage}
                    uploadProgress={uploadProgress}
                  />
                )}

                {activeTab === 'pedidos' && <TabPedidos orders={orders} />}

                {activeTab === 'taxonomia' && (
                  <TabTaxonomia
                    allTagsList={allTagsList}
                    dbTags={dbTags}
                    dbCategories={dbCategories}
                    selectedTags={selectedTags}
                    handleTagChange={handleTagChange}
                    handleReorderCategories={handleReorderCategories}
                    handleReorderTags={handleReorderTags}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <CoverManagerModal
        selectedAlbumForCover={selectedAlbumForCover}
        setSelectedAlbumForCover={setSelectedAlbumForCover}
        coverType={coverType}
        setCoverType={setCoverType}
        albumPhotos={albumPhotos}
        isPhotoLoading={isPhotoLoading}
        handleSetCover={handleSetCover}
      />
    </div>
  );
}